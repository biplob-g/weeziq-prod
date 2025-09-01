import { Header } from "@/components/header";
import { FooterSection } from "@/components/footer-section";
import { AnimatedSection } from "@/components/animated-section";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <div className="relative z-10 pt-20">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Have a question or need assistance? We&apos;d love to hear from
                you. Send us a message and we&apos;ll respond as soon as
                possible.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Send us a Message
                </h2>
                <ContactForm />
              </div>

              {/* Contact Information */}
              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">
                      Email Support
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      For general inquiries and support:
                    </p>
                    <a
                      href="mailto:support@weeziq.com"
                      className="text-primary hover:underline font-medium"
                    >
                      support@weeziq.com
                    </a>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">
                      Response Time
                    </h3>
                    <p className="text-muted-foreground">
                      We typically respond to all inquiries within 24 hours
                      during business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </main>
      </div>
      <FooterSection />
    </div>
  );
}
