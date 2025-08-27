"use client";

import React, { useState, useEffect } from "react";
import { onGetSubscriptionPlan } from "@/actions/settings";
import { onGetAiUsageStats } from "@/actions/settings";
import { getPlanLimits } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  MessageSquare,
  Zap,
  Plus,
  AlertTriangle,
  RotateCcw,
  Brain,
  Database,
  BarChart3,
  CreditCard,
} from "lucide-react";
import InfoBars from "@/components/infoBar";

interface RazorpayResponse {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const DashboardPage = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiUsageStats, setAiUsageStats] = useState<any>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sub, aiStats] = await Promise.all([
          onGetSubscriptionPlan(),
          user ? onGetAiUsageStats(user.id) : Promise.resolve(null),
        ]);

        setSubscription(sub);
        setAiUsageStats(aiStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <InfoBars />
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Unable to load subscription information.</p>
      </div>
    );
  }

  const currentPlan = subscription.plan || "STARTER";
  const planDetails = getPlanLimits(currentPlan);

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      title: "AI Chatbot Response",
      status: "success",
      time: "2 minutes ago",
      duration: "1.2s",
    },
    {
      id: 2,
      title: "Email Campaign Sent",
      status: "success",
      time: "5 minutes ago",
      duration: "30s",
    },
    {
      id: 3,
      title: "Visitor Tracking",
      status: "success",
      time: "12 minutes ago",
      duration: "2m 15s",
    },
    {
      id: 4,
      title: "Satisfaction Rating",
      status: "success",
      time: "18 minutes ago",
      duration: "1m 8s",
    },
    {
      id: 5,
      title: "Domain Integration",
      status: "error",
      time: "32 minutes ago",
      duration: "45s",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <InfoBars />

      {/* Action Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">New Domain</h3>
                <p className="text-sm text-muted-foreground">
                  Add a new website domain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Check failed integrations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Retry Failed</h3>
                <p className="text-sm text-muted-foreground">
                  Retry failed operations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Analytics - Left Side */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    AI chatbot performance and visitor trends
                  </CardDescription>
                </div>
                <Tabs defaultValue="conversations" className="w-auto">
                  <TabsList>
                    <TabsTrigger value="conversations">
                      Conversations
                    </TabsTrigger>
                    <TabsTrigger value="visitors">Visitors</TabsTrigger>
                    <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>

        {/* Recent Activity - Right Side */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time} - {activity.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Plan Usage - Bottom Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan Usage - {planDetails.name}
          </CardTitle>
          <CardDescription>
            Track your current plan usage and remaining credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Credits Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">AI Chatbot Conversations</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription.aiCreditsUsed || 0} /{" "}
                {subscription.aiCreditsLimit || 0} credits used
              </span>
            </div>
            <Progress
              value={
                subscription.aiCreditsLimit && subscription.aiCreditsLimit > 0
                  ? ((subscription.aiCreditsUsed || 0) /
                      subscription.aiCreditsLimit) *
                    100
                  : 0
              }
              className="h-2"
            />
            {currentPlan !== "STARTER" && (
              <p className="text-xs text-muted-foreground">
                After {subscription.aiCreditsLimit} credits, unlimited Gemini
                2.5 Flash-Lite model
              </p>
            )}
          </div>

          {/* Email Credits Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email Lead Campaigns</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription.emailCreditsUsed || 0} /{" "}
                {subscription.emailCreditsLimit || 0} emails sent
              </span>
            </div>
            <Progress
              value={
                subscription.emailCreditsLimit &&
                subscription.emailCreditsLimit > 0
                  ? ((subscription.emailCreditsUsed || 0) /
                      subscription.emailCreditsLimit) *
                    100
                  : 0
              }
              className="h-2"
            />
          </div>

          {/* Domains Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Active Domains</span>
            </div>
            <span className="text-sm font-semibold">
              {subscription.domains}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* AI Usage Statistics - Development Section */}
      {aiUsageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Usage Statistics (Development)
            </CardTitle>
            <CardDescription>
              Detailed breakdown of AI model token usage and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Total Tokens
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {aiUsageStats.stats?.total?.tokensUsed?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-blue-600">
                  {aiUsageStats.stats?.total?.messageCount || 0} messages
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    Recent Usage
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {aiUsageStats.stats?.recent?.tokensUsed?.toLocaleString() ||
                    0}
                </div>
                <p className="text-xs text-green-600">
                  Last 30 days • {aiUsageStats.stats?.recent?.messageCount || 0}{" "}
                  messages
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Credits Used
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {aiUsageStats.stats?.total?.creditsUsed || 0}
                </div>
                <p className="text-xs text-purple-600">
                  Total credits consumed
                </p>
              </div>
            </div>

            {/* Usage by Model */}
            {aiUsageStats.stats?.byModel &&
              aiUsageStats.stats.byModel.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">
                    Usage by Model
                  </h4>
                  <div className="space-y-2">
                    {aiUsageStats.stats.byModel.map(
                      (model: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="font-medium text-sm">
                              {model.model}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {model.tokensUsed?.toLocaleString() || 0} tokens
                            </div>
                            <div className="text-xs text-gray-500">
                              {model.messageCount || 0} messages
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Usage by Domain */}
            {aiUsageStats.stats?.byDomain &&
              aiUsageStats.stats.byDomain.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">
                    Usage by Domain
                  </h4>
                  <div className="space-y-2">
                    {aiUsageStats.stats.byDomain.map(
                      (domain: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="font-medium text-sm">
                              {domain.domainName}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {domain.tokensUsed?.toLocaleString() || 0} tokens
                            </div>
                            <div className="text-xs text-gray-500">
                              {domain.messageCount || 0} messages
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Development Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Development Feature
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This section shows detailed AI token usage for development
                    and debugging purposes. Token counts are estimated based on
                    character length (4 chars ≈ 1 token).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
