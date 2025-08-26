export const getPlanLimits = (plan: string) => {
  const planLimits = {
    STARTER: {
      name: "Starter Plan",
      price: "Free Trial - 14 Days",
      aiCredits: 50,
      emailCredits: 50,
      domainLimit: 1, // Free trial users can add 1 domain
      features: [
        "50 AI chatbot conversations (credit-based)",
        "50 Email Lead campaigns (credit-based)",
        "14-day free trial",
        "1 domain",
      ],
    },
    GROWTH: {
      name: "Growth Plan",
      price: "$12/month",
      aiCredits: 100,
      emailCredits: 200,
      domainLimit: 2, // Growth plan users can add 2 domains
      features: [
        "100 AI chatbot conversations/month (Gemini 2.5 Pro)",
        "Unlimited Gemini 2.5 Flash-Lite after credits",
        "Unlimited human chatbot messages",
        "200 Email Lead campaigns/month",
        "Google Spreadsheet integration",
        "2 domains",
      ],
    },
    PRO: {
      name: "Pro Plan",
      price: "$39/month",
      aiCredits: 500,
      emailCredits: 1000,
      domainLimit: 5, // Pro plan users can add up to 5 domains
      features: [
        "500 AI chatbot conversations/month (Gemini 2.5 Pro)",
        "Unlimited Gemini 2.5 Flash-Lite after credits",
        "Unlimited human chatbot messages",
        "1000 Email Lead campaigns/month",
        "Google Spreadsheet integration",
        "5 domains",
      ],
    },
  };

  return planLimits[plan as keyof typeof planLimits] || planLimits.STARTER;
};

export const canAddDomain = (
  currentPlan: string,
  currentDomainCount: number
): boolean => {
  const planLimits = getPlanLimits(currentPlan);
  return currentDomainCount < planLimits.domainLimit;
};

export const getDomainLimitInfo = (
  currentPlan: string,
  currentDomainCount: number
) => {
  const planLimits = getPlanLimits(currentPlan);
  const remaining = Math.max(0, planLimits.domainLimit - currentDomainCount);

  return {
    current: currentDomainCount,
    limit: planLimits.domainLimit,
    remaining,
    canAdd: remaining > 0,
    planName: planLimits.name,
  };
};

export type PlanType = "STARTER" | "GROWTH" | "PRO";

export interface PlanDetails {
  name: string;
  price: string;
  aiCredits: number;
  emailCredits: number;
  domainLimit: number;
  features: string[];
}
