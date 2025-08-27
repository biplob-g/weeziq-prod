import { Header } from "@/components/header";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <div className="relative z-10 pt-20">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Refund and Return Policy
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
                  1. 14-Day Free Trial
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All new accounts include a 14-day free trial</li>
                  <li>Full access to features during trial period</li>
                  <li>No credit card required for trial activation</li>
                  <li>
                    Automatic conversion to paid plan after trial (with prior
                    notice)
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  2. Subscription Refunds
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Monthly Subscriptions:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        Full refund available within 7 days of first payment
                      </li>
                      <li>
                        Pro-rated refunds for cancellations after 7 days within
                        first month
                      </li>
                      <li>No refunds for subsequent monthly payments</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Annual Subscriptions:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Full refund available within 30 days of payment</li>
                      <li>Pro-rated refunds available within first 90 days</li>
                      <li>No refunds after 90 days</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  3. Refund Eligibility
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3 text-green-600">
                      Eligible for Refund:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        Technical issues preventing service use (after support
                        attempts)
                      </li>
                      <li>Billing errors or unauthorized charges</li>
                      <li>Service cancellation within specified timeframes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3 text-red-600">
                      Not Eligible for Refund:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Change of mind after trial period</li>
                      <li>Failure to use service features</li>
                      <li>
                        Violation of Terms and Conditions resulting in
                        termination
                      </li>
                      <li>Custom development or setup work</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  4. Refund Process
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Submit refund request to <strong>billing@weeziq.com</strong>
                  </li>
                  <li>Include account email and reason for refund</li>
                  <li>Processing time: 5-10 business days</li>
                  <li>Refunds issued to original payment method</li>
                  <li>Account access terminated upon refund processing</li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  5. Chargebacks
                </h2>
                <p className="text-muted-foreground">
                  Initiating a chargeback without contacting us first may result
                  in immediate account termination and restriction from future
                  services.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  6. Enterprise and Custom Plans
                </h2>
                <p className="text-muted-foreground">
                  Custom refund terms may apply to Enterprise plans as specified
                  in individual contracts.
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
