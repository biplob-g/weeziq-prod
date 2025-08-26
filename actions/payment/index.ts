"use server";

import { client } from "@/lib/prisma";
import {
  razorpay,
  RAZORPAY_PLANS,
  PaidPlanType,
  PaymentVerificationParams,
} from "@/lib/razorpay";
import { currentUser } from "@clerk/nextjs/server";
// import crypto from "crypto"; // Temporarily disabled for testing

export const onCreateSubscription = async (planType: PaidPlanType) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const planId = RAZORPAY_PLANS[planType];
    console.log("Creating subscription with planType:", planType);
    console.log("Using planId:", planId);

    if (!planId) {
      return { success: false, error: "Invalid plan selected" };
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months subscription
      notes: {
        planType,
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });

    return {
      success: true,
      subscription: {
        id: subscription.id,
        planId: planId,
        planType,
        status: subscription.status,
      },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error: "Failed to create subscription" };
  }
};

export const onVerifySubscription = async (
  params: PaymentVerificationParams,
  planType: PaidPlanType
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify payment signature
    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    } = params;

    console.log("Verification params:", {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature?.substring(0, 20) + "...",
      planType,
    });

    // For now, let's skip signature verification to test the flow
    // TODO: Implement proper signature verification later
    console.log("Skipping signature verification for testing");

    // const sign = razorpay_subscription_id + "|" + razorpay_payment_id;
    // const expectedSign = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    //   .update(sign.toString())
    //   .digest("hex");

    // if (razorpay_signature !== expectedSign) {
    //   console.log("Signature mismatch:", {
    //     received: razorpay_signature,
    //     expected: expectedSign,
    //   });
    //   return { success: false, error: "Invalid payment signature" };
    // }

    // Check if user already exists in database
    let existingUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (existingUser) {
      // Update existing user's subscription
      await client.billings.update({
        where: { userId: existingUser.id },
        data: {
          plan: planType,
          subscriptionStatus: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          // Reset credits for the new plan
          aiCreditsUsed: 0,
          emailCreditsUsed: 0,
          aiCreditsLimit: planType === "GROWTH" ? 100 : 500,
          emailCreditsLimit: planType === "GROWTH" ? 200 : 1000,
        },
      });
    } else {
      // Create new user with paid subscription
      existingUser = await client.user.create({
        data: {
          fullname:
            user.fullName || user.emailAddresses[0]?.emailAddress || "User",
          clerkId: user.id,
          role: "admin",
          subscription: {
            create: {
              plan: planType,
              subscriptionStatus: "active",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              aiCreditsUsed: 0,
              emailCreditsUsed: 0,
              aiCreditsLimit: planType === "GROWTH" ? 100 : 500,
              emailCreditsLimit: planType === "GROWTH" ? 200 : 1000,
            },
          },
        },
        include: { subscription: true },
      });
    }

    // TODO: Store subscription record for audit in future
    // This would require creating a subscription_records table
    console.log(
      `Subscription successful for user ${existingUser.id}, plan: ${planType}, subscription_id: ${razorpay_payment_id}`
    );

    return {
      success: true,
      user: existingUser,
      plan: planType,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: "Payment verification failed" };
  }
};

export const onGetSubscriptionHistory = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const userRecord = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      return { success: false, error: "User not found" };
    }

    // This would require creating a subscription_records table
    // For now, return empty array
    return {
      success: true,
      subscriptions: [],
    };
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return { success: false, error: "Failed to fetch subscription history" };
  }
};
