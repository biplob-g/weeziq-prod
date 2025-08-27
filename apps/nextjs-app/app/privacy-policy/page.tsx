import { Header } from "@/components/header";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <div className="relative z-10 pt-20">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Privacy Policy
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
                  1. Information We Collect
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Personal Information:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        Name, email address, phone number when you create an
                        account
                      </li>
                      <li>
                        Payment information (processed securely through
                        third-party providers)
                      </li>
                      <li>
                        Company information and website details you provide
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Usage Data:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Chatbot conversation logs and analytics</li>
                      <li>Website usage patterns and feature interactions</li>
                      <li>
                        Technical data including IP addresses, browser type, and
                        device information
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Third-Party Integrations:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        Data from connected services (Google Sheets, HubSpot,
                        Mailchimp) as authorized by you
                      </li>
                      <li>
                        OAuth tokens and integration settings (stored encrypted)
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  2. How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and improve WeezIQ chatbot services</li>
                  <li>Train and customize your AI chatbot responses</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>
                    Send service updates, security alerts, and customer support
                  </li>
                  <li>
                    Analyze usage patterns to enhance platform performance
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  3. Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share data
                  only in these circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Service Providers:</strong> With trusted third
                    parties who assist our operations (payment processors,
                    hosting providers)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In case of merger,
                    acquisition, or sale of assets
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  4. Data Security
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All data encrypted in transit and at rest</li>
                  <li>
                    Secure cloud infrastructure with regular security audits
                  </li>
                  <li>Limited access controls and employee training</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  5. Your Rights
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Access:</strong> Request copies of your personal
                    data
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and associated data
                  </li>
                  <li>
                    <strong>Portability:</strong> Export your data in standard
                    formats
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  6. Data Retention
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Account data retained while your subscription is active
                  </li>
                  <li>
                    Chat logs and analytics data retained for 24 months after
                    account closure
                  </li>
                  <li>
                    Financial records retained as required by law (typically 7
                    years)
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  7. Cookies and Tracking
                </h2>
                <p className="text-muted-foreground">
                  We use essential cookies for platform functionality and
                  optional analytics cookies to improve user experience. You can
                  manage cookie preferences in your browser settings.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  8. International Data Transfers
                </h2>
                <p className="text-muted-foreground">
                  Your data may be processed in countries other than your
                  residence. We ensure appropriate safeguards are in place for
                  international transfers.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  9. Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  For privacy-related questions or requests, contact us at:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Email:</strong> privacy@weeziq.com
                  </p>
                  <p>
                    <strong>Address:</strong> [Your Business Address]
                  </p>
                </div>
              </section>
            </div>
          </AnimatedSection>
        </main>
      </div>
      <FooterSection />
    </div>
  );
}
