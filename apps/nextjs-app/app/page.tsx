import { HeroSection } from "@/components/hero-section";
import { DashboardPreview } from "@/components/dashboard-preview";
import { BentoSection } from "@/components/bento-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";
import { Header } from "@/components/header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <Header />
      <div className="relative z-10">
        <main className="max-w-[1280px] mx-auto relative">
          <HeroSection />
          {/* Dashboard Preview Wrapper */}
          <div className="absolute sm:bottom-[-150px] lg:bottom-[-450px] left-1/2 transform -translate-x-1/2 z-30">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        <AnimatedSection
          id="features-section"
          className="relative z-10 max-w-[1280px] mx-auto mt-16 sm:mt-[150px] lg:mt-20 pt-20"
          delay={0.2}
        >
          <BentoSection />
        </AnimatedSection>
        <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1280px] mx-auto mt-8 md:mt-0 pt-15"
          delay={0.2}
        >
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection
          id="faq-section"
          className="relative z-10 max-w-[1280px] mx-auto mt-8 md:mt-16 pt-20"
          delay={0.2}
        >
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection
          className="relative z-10 max-w-[1280px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <CTASection />
        </AnimatedSection>
        <AnimatedSection
          className="relative z-10 max-w-[1280px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  );
}
