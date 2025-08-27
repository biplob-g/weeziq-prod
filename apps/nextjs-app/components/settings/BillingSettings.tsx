import React from "react";
import Section from "../SectionLabel";
import { onGetSubscriptionPlan } from "@/actions/settings";
import { getPlanLimits } from "@/lib/plans";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Plus, CreditCard, MessageSquare, Mail } from "lucide-react";

export const BillingSettings = async () => {
  const subscription = await onGetSubscriptionPlan();

  if (!subscription) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-1">
          <Section
            label="Billing Settings"
            message="Add payment information, upgrade and modify your plan"
          />
        </div>
        <div className="lg:col-span-4">
          <p>Unable to load subscription information.</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription.plan || "STARTER";
  const planDetails = getPlanLimits(currentPlan);

  // Calculate progress percentages
  const aiCreditProgress =
    subscription.aiCreditsLimit && subscription.aiCreditsLimit > 0
      ? ((subscription.aiCreditsUsed || 0) / subscription.aiCreditsLimit) * 100
      : 0;

  const emailCreditProgress =
    subscription.emailCreditsLimit && subscription.emailCreditsLimit > 0
      ? ((subscription.emailCreditsUsed || 0) /
          subscription.emailCreditsLimit) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <Section
        label="Billing Settings"
        message="Manage your subscription, view usage, and upgrade your plan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge
                variant={currentPlan === "STARTER" ? "secondary" : "default"}
              >
                {planDetails.name}
              </Badge>
            </CardTitle>
            <CardDescription>{planDetails.price}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {currentPlan === "STARTER" &&
                "Perfect if you are just getting started with WeezGen"}
              {currentPlan === "GROWTH" &&
                "Ideal for growing businesses with higher AI needs"}
              {currentPlan === "PRO" &&
                "The ultimate plan for established businesses"}
            </p>

            {/* Features List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Plan Features:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Usage Overview
            </CardTitle>
            <CardDescription>
              Track your current usage and remaining credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">AI Conversations</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {subscription.aiCreditsUsed || 0} /{" "}
                  {subscription.aiCreditsLimit || 0}
                </span>
              </div>
              <Progress value={aiCreditProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {currentPlan !== "STARTER" && aiCreditProgress >= 100
                  ? "Using unlimited Flash-Lite model"
                  : `${
                      (subscription.aiCreditsLimit || 0) -
                      (subscription.aiCreditsUsed || 0)
                    } Pro model credits remaining`}
              </p>
            </div>

            {/* Email Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Campaigns</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {subscription.emailCreditsUsed || 0} /{" "}
                  {subscription.emailCreditsLimit || 0}
                </span>
              </div>
              <Progress value={emailCreditProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {(subscription.emailCreditsLimit || 0) -
                  (subscription.emailCreditsUsed || 0)}{" "}
                emails remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Section */}
      {currentPlan === "STARTER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-dashed border-blue-300 bg-blue-50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full border-2 border-blue-400 p-2 mb-2">
                <Plus className="text-blue-600 h-6 w-6" />
              </div>
              <CardTitle className="text-lg mb-2">Upgrade to Growth</CardTitle>
              <CardDescription className="mb-4">
                $12/month - 100 AI credits + unlimited Flash model
              </CardDescription>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Upgrade to Growth
              </button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-purple-300 bg-purple-50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full border-2 border-purple-400 p-2 mb-2">
                <Plus className="text-purple-600 h-6 w-6" />
              </div>
              <CardTitle className="text-lg mb-2">Upgrade to Pro</CardTitle>
              <CardDescription className="mb-4">
                $39/month - 500 AI credits + unlimited Flash model
              </CardDescription>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                Upgrade to Pro
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Information */}
      <Card>
        <CardHeader>
          <CardTitle>How Credits Work</CardTitle>
          <CardDescription>
            Understanding the credit-based pricing system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Pro Model Credits</h4>
                <p className="text-blue-700 text-xs mt-1">
                  1 credit = 1000 tokens. High-quality AI responses using Gemini
                  2.5 Pro.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Flash Model</h4>
                <p className="text-green-700 text-xs mt-1">
                  Unlimited usage after Pro credits exhausted. Fast responses
                  using Gemini 2.5 Flash-Lite.
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900">Email Campaigns</h4>
                <p className="text-orange-700 text-xs mt-1">
                  Send targeted email campaigns to your leads. Credit-based
                  system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
