"use client";

import React from "react";
import { Crown, Zap } from "lucide-react";

interface PlanCardProps {
  currentPlan: "STARTER" | "GROWTH" | "PRO";
  isExpanded?: boolean;
}

export function PlanCard({ currentPlan, isExpanded = false }: PlanCardProps) {
  // Don't show card if current plan is PRO or sidebar is collapsed
  if (currentPlan === "PRO" || !isExpanded) {
    return null;
  }

  // Determine upgrade plan and content based on current plan
  const getUpgradeInfo = () => {
    if (currentPlan === "STARTER") {
      return {
        name: "Growth",
        price: "$12",
        description:
          "Scale your business with advanced AI features and integrations",
        buttonText: "Get Growth",
        icon: Zap,
      };
    } else if (currentPlan === "GROWTH") {
      return {
        name: "Pro",
        price: "$39",
        description:
          "Enterprise features with unlimited conversations and custom AI",
        buttonText: "Upgrade to Pro",
        icon: Crown,
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeInfo();
  if (!upgradeInfo) return null;

  const IconComponent = upgradeInfo.icon;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-4 mb-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

      {/* Logo */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-purple-700" />
        </div>
        <div className="text-white text-sm font-semibold">
          {upgradeInfo.name}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">
            {upgradeInfo.price}
          </span>
          <span className="text-white/70 text-sm">/month</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-white/90 text-sm leading-relaxed">
          {upgradeInfo.description}
        </p>
      </div>

      {/* Call to Action Button */}
      <button className="w-full bg-white hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
        {upgradeInfo.buttonText}
      </button>
    </div>
  );
}
