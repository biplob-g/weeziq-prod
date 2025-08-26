import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Meteors } from "@/components/magicui/meteors";
import { Cover } from "@/components/ui/cover";

export function HeroSection() {
  return (
    <section
      className="flex flex-col items-center text-center relative mx-auto rounded-2xl overflow-hidden my-6 py-0 px-4
         w-full h-[500px] md:w-[1220px] md:h-[600px] lg:h-[810px] md:px-0"
    >
      <Meteors opacity={0.3} />
      <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6 mb-6 md:mb-7 lg:mb-9 max-w-md lg:max-w-[1200px] mt-32 md:mt-[160px] lg:mt-[200px] px-4">
        <h1 className="text-foreground text-3xl md:text-4xl lg:text-7xl font-semibold leading-tight">
          Turn Every Visitor Into a Sales Lead With <Cover>AI Chat</Cover>
        </h1>
        <p className="text-muted-foreground text-base md:text-base lg:text-lg lg:max-w-[800px] w-full font-medium leading-relaxed max-w-lg mx-auto">
          Accelerate conversions by allowing AI chat to engage every visitor,
          answer product questions, and create a smooth path from first click to
          final purchase.
        </p>
      </div>
      <Link
        href="https://vercel.com/home"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="relative z-10 btn-primary-gradient px-8 py-3 font-medium text-base shadow-lg">
          Start Free Trial
        </Button>
      </Link>
    </section>
  );
}
