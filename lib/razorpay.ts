import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay environment variables are not set");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface PaymentVerificationParams {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Razorpay Subscription Plan IDs
export const RAZORPAY_PLANS = {
  GROWTH: "plan_R5acBKmhX9JAaI", // Growth Plan
  PRO: "plan_R5bCdCp8lejHDm", // Pro Plan
} as const;

export type PaidPlanType = keyof typeof RAZORPAY_PLANS;
