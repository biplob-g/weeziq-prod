import { Header } from "@/components/header";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <div className="relative z-10 pt-20">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Shipping Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                Last Updated: August 24, 2025
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Service Delivery
                </h2>
                <p className="text-muted-foreground">
                  WeezIQ is a cloud-based software service with no physical
                  products requiring shipping.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Digital Service Delivery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Account Access
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Immediate upon registration
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Feature Activation
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Instant for standard plans
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Integration Setup
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Available immediately via dashboard
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Custom Configurations
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      24-48 hours for Enterprise setups
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  International Availability
                </h2>
                <p className="text-muted-foreground">
                  WeezIQ is available globally through our cloud infrastructure.
                  Service quality may vary based on internet connectivity and
                  local regulations.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Support and Onboarding
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Self-Service Setup
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Available 24/7 through dashboard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Email Support
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Response within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Priority Support
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Available for Pro and Enterprise customers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Setup Assistance
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Available upon request
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Service Updates
                </h2>
                <p className="text-muted-foreground">
                  All platform updates and new features are delivered
                  automatically to your account with no additional action
                  required.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Contact for Service Issues
                </h2>
                <p className="text-muted-foreground">
                  For any service delivery concerns, contact{" "}
                  <strong>support@weeziq.com</strong>
                </p>
              </section>
            </div>
          </AnimatedSection>
        </main>
      </div>
      <FooterSection />
    </div>
  );
}
