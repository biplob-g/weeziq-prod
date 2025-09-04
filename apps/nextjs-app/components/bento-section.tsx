import React from "react";

interface BentoCardProps {
  title: string;
  description: string;
}

const BentoCard = ({ title, description }: BentoCardProps) => (
  <div className="overflow-hidden rounded-2xl bento-card-bg flex flex-col justify-center items-center relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-8 flex flex-col justify-center items-center gap-4 relative z-10 min-h-[200px]">
      <div className="self-stretch flex flex-col justify-center items-center gap-3 text-center">
        <h3 className="text-foreground text-xl font-semibold leading-7">
          {title}
        </h3>
        <p className="text-muted-foreground text-base font-normal leading-6 max-w-sm">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export function BentoSection() {
  const cards = [
    {
      title: "Smart conversation flows.",
      description:
        "AI that understands context and guides prospects naturally.",
    },
    {
      title: "Real-time lead qualification",
      description: "Instantly identify and prioritize high-value prospects.",
    },
    {
      title: "Seamless CRM integration",
      description: "Connect with Salesforce, HubSpot, and 50+ platforms.",
    },
    {
      title: "Multi-channel deployment",
      description: "Deploy across website, WhatsApp, Slack, and more.",
    },
    {
      title: "Parallel conversation handling",
      description: "Handle unlimited conversations simultaneously.",
    },
    {
      title: "Instant setup & deployment",
      description: "Go live in minutes with our no-code builder.",
    },
  ];

  return (
    <section className="w-full lg:mt-[300px] px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Supercharge Your Sales with AI
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Deploy an intelligent sales assistant that qualifies leads,
              answers questions, and converts prospects into customers around
              the clock.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard
              key={card.title}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
