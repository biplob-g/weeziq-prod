import { Header } from "@/components/header";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <div className="relative z-10 pt-20">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Terms and Conditions
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground">
                  By using WeezIQ (&quot;Service&quot;), you agree to these
                  Terms and Conditions. If you disagree with any part, please
                  discontinue use immediately.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  2. Service Description
                </h2>
                <p className="text-muted-foreground mb-4">
                  WeezIQ provides AI-powered chatbot services for websites,
                  including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Automated customer support and lead generation</li>
                  <li>Integration with third-party platforms</li>
                  <li>Analytics and conversation management tools</li>
                  <li>Custom training and knowledge base management</li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  3. Account Registration
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    You must provide accurate, complete information during
                    registration
                  </li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per individual or business entity</li>
                  <li>
                    Minimum age requirement: 18 years or legal age in your
                    jurisdiction
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  4. Subscription Plans and Billing
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        Growth Plan
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        $12/month - Basic features and integrations
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        Pro Plan
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        $39/month - Advanced features and unlimited integrations
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        Enterprise Plan
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Custom pricing for large organizations
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>All plans billed monthly or annually in advance</li>
                    <li>Price changes with 30-day advance notice</li>
                  </ul>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  5. Acceptable Use Policy
                </h2>
                <p className="text-muted-foreground mb-4">
                  You may not use WeezIQ to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Violate any laws or regulations</li>
                  <li>Send spam, malware, or malicious content</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Interfere with platform security or functionality</li>
                  <li>Use for illegal, harmful, or unethical purposes</li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  6. Intellectual Property
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    WeezIQ retains all rights to the platform and technology
                  </li>
                  <li>You retain ownership of your content and data</li>
                  <li>
                    You grant us license to use your data to provide services
                  </li>
                  <li>Respect third-party intellectual property rights</li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  7. Service Availability
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    We aim for 99.9% uptime but cannot guarantee uninterrupted
                    service
                  </li>
                  <li>
                    Scheduled maintenance with advance notice when possible
                  </li>
                  <li>
                    No liability for service interruptions beyond our control
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  8. Data Backup and Security
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You are responsible for backing up critical data</li>
                  <li>
                    We provide data export tools but recommend regular backups
                  </li>
                  <li>
                    We implement security measures but cannot guarantee complete
                    security
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  9. Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  WeezIQ&apos;s liability is limited to the amount paid for
                  services in the 12 months preceding the claim. We are not
                  liable for indirect, consequential, or punitive damages.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  10. Termination
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Either party may terminate with 30-day notice</li>
                  <li>Immediate termination for Terms violations</li>
                  <li>Data export available for 30 days after termination</li>
                  <li>
                    Refunds calculated pro-rata for unused subscription periods
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  11. Governing Law
                </h2>
                <p className="text-muted-foreground">
                  These Terms are governed by [Your Jurisdiction] law. Disputes
                  resolved through binding arbitration.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  12. Contact Information
                </h2>
                <p className="text-muted-foreground">
                  Questions about these Terms: <strong>legal@weeziq.com</strong>
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
