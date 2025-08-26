import { NextRequest, NextResponse } from "next/server";
import { onVerifySubscription } from "@/actions/payment";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Payment verification API received:", body);

    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = body;

    if (
      !razorpay_subscription_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !planType
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required payment parameters" },
        { status: 400 }
      );
    }

    const result = await onVerifySubscription(
      {
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      planType
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Subscription verification API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
