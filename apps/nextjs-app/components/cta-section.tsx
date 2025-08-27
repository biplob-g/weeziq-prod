import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full pt-20 md:pt-10 lg:pt-20 pb-10 md:pb-20 px-5 relative flex flex-col justify-center items-center overflow-visible">
      <div className="relative z-10 flex flex-col justify-start items-center gap-9 max-w-4xl mx-auto">
        <div className="flex flex-col justify-start items-center gap-4 text-center">
          <h2 className="text-foreground text-4xl md:text-5xl lg:text-[68px] font-semibold leading-tight md:leading-tight lg:leading-[76px] break-words max-w-[435px]">
            Ready to 10x Your Sales?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-medium leading-[18.20px] md:leading-relaxed break-words max-w-2xl">
            Join thousands of sales teams who&apos;ve transformed their
            conversion rates with AI-powered sales automation. Start your free
            trial today.
          </p>
        </div>
        <Link
          href="https://vercel.com/home"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            className="btn-primary-gradient px-[30px] py-2 text-base font-medium leading-6 shadow-lg transition-all duration-200"
            size="lg"
          >
            Start Free Trial
          </Button>
        </Link>
      </div>
    </section>
  );
}
