"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { useCurrency, convertPrice } from "@/lib/currencyConverter";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false); // Show monthly by default
  const { currency, loading } = useCurrency();
  const [convertedPlans, setConvertedPlans] = useState<any[]>([]);

  const basePricingPlans = [
    {
      name: "Free",
      monthlyPriceUSD: 0,
      annualPriceUSD: 0, // Free plan
      description: "Perfect for small businesses getting started.",
      features: [
        "Up to 100 conversations/month",
        "Basic conversation flows",
        "Email support",
        "Website chat widget",
        "Lead capture forms",
      ],
      buttonText: "Get Started",
      buttonClass:
        "bg-secondary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] outline outline-0.5 outline-border outline-offset-[-0.5px] text-secondary-foreground text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-secondary/90",
    },
    {
      name: "Growth",
      monthlyPriceUSD: 12,
      annualPriceUSD: Math.round(12 * 12 * 0.9), // 12 months with 10% discount = 129.6 -> 130
      description: "Ideal for growing sales teams.",
      features: [
        "Up to 1,000 conversations/month",
        "Advanced AI conversation flows",
        "CRM integrations (Salesforce, HubSpot)",
        "Multi-channel deployment",
        "Real-time analytics dashboard",
        "Priority email and chat support",
        "Custom branding",
      ],
      buttonText: "Start Free Trial",
      buttonClass: "btn-primary-gradient",
      popular: true,
    },
    {
      name: "Pro",
      monthlyPriceUSD: 39,
      annualPriceUSD: Math.round(39 * 12 * 0.9), // 12 months with 10% discount = 421.2 -> 421
      description: "For large organizations with complex needs.",
      features: [
        "Unlimited conversations",
        "Custom AI model training",
        "Advanced integrations & APIs",
        "Dedicated account manager",
        "White-label solution",
        "Custom security & compliance",
      ],
      buttonText: "Contact Sales",
      buttonClass:
        "bg-secondary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-secondary-foreground text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-secondary/90",
    },
  ];

  // Convert prices when currency changes
  useEffect(() => {
    if (!loading) {
      const converted = basePricingPlans.map((plan) => {
        const monthlyConverted = convertPrice(plan.monthlyPriceUSD, currency);
        // For annual display, show the monthly equivalent (annual total / 12)
        const annualMonthlyEquivalent = plan.annualPriceUSD / 12;
        const annualConverted = convertPrice(annualMonthlyEquivalent, currency);

        return {
          ...plan,
          monthlyPrice: monthlyConverted.displayPrice,
          annualPrice: annualConverted.displayPrice,
        };
      });
      setConvertedPlans(converted);
    }
  }, [currency, loading]);

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-6xl md:leading-[66px] text-center text-foreground font-semibold leading-tight">
            Pricing that scales with <br />
            your business
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-tight">
            Choose a plan that fits your sales goals, from startups to
            enterprise <br /> organizations looking to automate their sales
            process.
          </p>
        </div>
        <div className="pt-4">
          <div className="p-0.5 bg-muted rounded-lg outline-1 outline-border outline-offset-[-1px] flex justify-start items-center gap-1 md:mt-0">
            <button
              onClick={() => setIsAnnual(true)}
              className={`pl-2 pr-1 py-1 flex justify-start items-start gap-2 rounded-md ${
                isAnnual
                  ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]"
                  : ""
              }`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight ${
                  isAnnual ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                Annually
              </span>
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-2 py-1 flex justify-start items-start rounded-md ${
                !isAnnual
                  ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]"
                  : ""
              }`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight ${
                  !isAnnual ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch px-5 flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6 mt-6 max-w-[1100px] mx-auto">
        {loading ? (
          <div className="flex justify-center items-center w-full py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Loading pricing...
            </span>
          </div>
        ) : (
          convertedPlans.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 p-4 overflow-hidden rounded-xl flex flex-col justify-start items-start gap-6 relative bg-card border border-border`}
              style={{}}
            >
              {/* Border Beam for Professional (Growth) plan */}
              {plan.popular && (
                <BorderBeam
                  colorFrom="#7c46e6"
                  colorTo="#9c40ff"
                  duration={10}
                  size={150}
                  borderWidth={5}
                />
              )}
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch flex flex-col justify-start items-start gap-8">
                  <div
                    className={`w-full h-5 text-lg  font-semibold leading-tight text-foreground`}
                  >
                    {plan.name}
                    {plan.popular && (
                      <div className="ml-2 px-3 py-1 rounded-none items-center bg-primary text-primary-foreground absolute top-6 right-[-128px] transform rotate-45 flex justify-center w-full">
                        <span className="text-xs font-medium">Best Value</span>
                      </div>
                    )}
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="flex justify-start items-center gap-1.5">
                      <div
                        className={`relative h-10 flex items-center text-3xl font-medium leading-10 text-foreground`}
                      >
                        <span className="invisible">
                          {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span
                          className="absolute inset-0 flex items-center transition-all duration-500"
                          style={{
                            opacity: isAnnual ? 1 : 0,
                            transform: `scale(${isAnnual ? 1 : 0.8})`,
                            filter: `blur(${isAnnual ? 0 : 4}px)`,
                          }}
                          aria-hidden={!isAnnual}
                        >
                          {plan.annualPrice}
                        </span>
                        <span
                          className="absolute inset-0 flex items-center transition-all duration-500"
                          style={{
                            opacity: !isAnnual ? 1 : 0,
                            transform: `scale(${!isAnnual ? 1 : 0.8})`,
                            filter: `blur(${!isAnnual ? 0 : 4}px)`,
                          }}
                          aria-hidden={isAnnual}
                        >
                          {plan.monthlyPrice}
                        </span>
                      </div>
                      <div
                        className={`text-center text-sm font-medium leading-tight text-muted-foreground`}
                      >
                        /month
                      </div>
                    </div>
                    <div
                      className={`self-stretch text-sm font-medium leading-tight text-muted-foreground`}
                    >
                      {plan.description}
                    </div>
                  </div>
                </div>
                <Button
                  className={`self-stretch px-5 py-2 rounded-[40px] flex justify-center items-center ${plan.buttonClass}`}
                >
                  <div className="px-1.5 flex justify-center items-center gap-2">
                    <span
                      className={`text-center text-sm font-medium leading-tight ${
                        plan.name === "Standard"
                          ? "text-secondary-foreground"
                          : plan.name === "Growth"
                          ? "text-secondary-foreground"
                          : "text-secondary-foreground"
                      }`}
                    >
                      {plan.buttonText}
                    </span>
                  </div>
                </Button>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div
                  className={`self-stretch text-sm font-medium leading-tight ${
                    plan.popular
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.name === "Standard"
                    ? "Get Started today:"
                    : "Everything in Standard +"}
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  {plan.features.map((feature: string) => (
                    <div
                      key={feature}
                      className="self-stretch flex justify-start items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Check
                          className={`w-full h-full text-muted-foreground`}
                          strokeWidth={2}
                        />
                      </div>
                      <div
                        className={`leading-tight font-normal text-sm text-left text-muted-foreground`}
                      >
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
