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
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Welcome to WeezIQ!
                </h2>
                <p className="text-muted-foreground mb-4">
                  These terms and conditions outline the rules and regulations
                  for the use of WeezIQ&apos;s Website, located at{" "}
                  <a
                    href="https://weeziq.com"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://weeziq.com
                  </a>
                  .
                </p>
                <p className="text-muted-foreground mb-4">
                  By accessing this website we assume that you accept these
                  terms and conditions. Do not continue to use weeziq.com if you
                  do not agree to take all of the terms and conditions stated on
                  this page.
                </p>
                <p className="text-muted-foreground">
                  The following terminology applies to these Terms and
                  Conditions, Privacy Statement and Disclaimer Notice and all
                  Agreements: &quot;Client&quot;, &quot;You&quot; and
                  &quot;Your&quot; refers to you, the person log on this website
                  and compliant to the Company&apos;s terms and conditions.
                  &quot;The Company&quot;, &quot;Ourselves&quot;,
                  &quot;We&quot;, &quot;Our&quot; and &quot;Us&quot;, refers to
                  our Company. &quot;Party&quot;, &quot;Parties&quot;, or
                  &quot;Us&quot;, refers to both the Client and ourselves. All
                  terms refer to the offer, acceptance and consideration of
                  payment necessary to undertake the process of our assistance
                  to the Client in the most appropriate manner for the express
                  purpose of meeting the Client&apos;s needs in respect of
                  provision of the Company&apos;s stated services, in accordance
                  with and subject to WeezIQ. Any use of the above terminology
                  or other words in the singular, plural, capitalization and/or
                  he/she or they, are taken as interchangeable and therefore as
                  referring to same.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Cookies
                </h2>
                <p className="text-muted-foreground mb-4">
                  We employ the use of cookies. By accessing weeziq.com, you
                  agreed to use cookies in agreement with the weeziq.com Privacy
                  Policy.
                </p>
                <p className="text-muted-foreground mb-4">
                  Most interactive websites use cookies to let us retrieve the
                  user&apos;s details for each visit. Cookies are used by our
                  website to enable the functionality of certain areas to make
                  it easier for people visiting our website. Some of our
                  affiliate/advertising partners may also use cookies.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Hyperlinking to our Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  The following organizations may link to our Website without
                  prior written approval:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Government agencies;</li>
                  <li>Search engines;</li>
                  <li>News organizations;</li>
                  <li>
                    Online directory distributors may link to our Website in the
                    same manner as they hyperlink to the Websites of other
                    listed businesses; and
                  </li>
                  <li>
                    System wide Accredited Businesses except soliciting
                    non-profit organizations, charity shopping malls, and
                    charity fundraising groups which may not hyperlink to our
                    Web site.
                  </li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  These organizations may link to our home page, to publications
                  or to other Website information so long as the link: (a) is
                  not in any way deceptive; (b) does not falsely imply
                  sponsorship, endorsement or approval of the linking party and
                  its products and/or services; and (c) fits within the context
                  of the linking party&apos;s site.
                </p>
                <p className="text-muted-foreground mb-4">
                  We may consider and approve other link requests from the
                  following types of organizations:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>
                    commonly-known consumer and/or business information sources;
                  </li>
                  <li>dot.com community sites;</li>
                  <li>associations or other groups representing charities;</li>
                  <li>online directory distributors;</li>
                  <li>internet portals;</li>
                  <li>accounting, law and consulting firms; and</li>
                  <li>educational institutions and trade associations.</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  We will approve link requests from these organizations if we
                  decide that: (a) the link would not make us look unfavorably
                  to ourselves or to our accredited businesses; (b) the
                  organization does not have any negative records with us; (c)
                  the benefit to us from the visibility of the hyperlink
                  compensates the absence of weeziq.com; and (d) the link is in
                  the context of general resource information.
                </p>
                <p className="text-muted-foreground mb-4">
                  These organizations may link to our home page so long as the
                  link: (a) is not in any way deceptive; (b) does not falsely
                  imply sponsorship, endorsement or approval of the linking
                  party and its products or services; and (c) fits within the
                  context of the linking party&apos;s site.
                </p>
                <p className="text-muted-foreground mb-4">
                  If you are one of the organizations listed in paragraph 2
                  above and are interested in linking to our website, you must
                  inform us by sending an e-mail to support@weeziq.com. Please
                  include your name, your organization name, contact information
                  as well as the URL of your site, a list of any URLs from which
                  you intend to link to our Website, and a list of the URLs on
                  our site to which you would like to link. Wait 2-3 weeks for a
                  response.
                </p>
                <p className="text-muted-foreground mb-4">
                  Approved organizations may hyperlink to our Website as
                  follows:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>By use of our corporate name; or</li>
                  <li>
                    By use of the uniform resource locator being linked to; or
                  </li>
                  <li>
                    By use of any other description of our Website being linked
                    to that makes sense within the context and format of content
                    on the linking party&apos;s site.
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  No use of weeziq.com logo or other artwork will be allowed for
                  linking absent a trademark license agreement.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Use of Product
                </h2>
                <p className="text-muted-foreground mb-4">
                  Furthermore, you agree to accept the following conditions.
                </p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                  <li>
                    Our random verification and validation methods and
                    techniques verify databases as a service or product. Before
                    you make any purchase, please ensure that you are satisfied
                    with the quality.
                  </li>
                  <li>
                    These databases are valid at the time they were validated by
                    us or Third parties. We never guarantee their accuracy.
                  </li>
                  <li>
                    In the near future, databases may not be valid or live.
                  </li>
                  <li>
                    Weeziq.com never gives any guarantee for whether the
                    databases provided by WeezIQ will be valid or active for
                    some period of time.
                  </li>
                  <li>
                    After purchasing the database(s) from www.weeziq.com,
                    &quot;USER&quot; has to use the database(s) only for their
                    product promotion and USER should not use it for spamming or
                    other illegal purposes.
                  </li>
                  <li>
                    Any third party can take legal action against any USER if
                    USER is involved in illegal activities or spamming.
                  </li>
                  <li>
                    Weeziq.com never gives any warranty or any guarantee or any
                    other promise to USERs for database(s) correctness,
                    accuracy, adequacy, usefulness, timeliness, reliability or
                    otherwise.
                  </li>
                  <li>
                    Money is non-refundable or non-transferable after purchasing
                    the database(s). All sales are final and non-refundable due
                    to the nature of data.
                  </li>
                  <li>
                    Any database or custom database or email list sold by
                    &apos;www.weeziq.com&apos; comes with no guarantee of
                    response rate or accuracy.
                  </li>
                  <li>
                    &apos;www.weeziq.com&apos; is never answerable, liable, or
                    questionable for accuracy of the database.
                  </li>
                  <li>
                    &apos;www.weeziq.com&apos; is a Lead Generation Services,
                    hereby, the information (data) is gathered from publicly
                    available 1st Party or 2nd Party.
                  </li>
                </ul>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  iFrames
                </h2>
                <p className="text-muted-foreground">
                  Without prior approval and written permission, you may not
                  create frames around our Webpages that alter in any way the
                  visual presentation or appearance of our Website.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Content Liability
                </h2>
                <p className="text-muted-foreground mb-4">
                  We shall not be hold responsible for any content that appears
                  on your Website. You agree to protect and defend us against
                  all claims that is rising on your Website. No link(s) should
                  appear on any Website that may be interpreted as libelous,
                  obscene or criminal, or which infringes, otherwise violates,
                  or advocates the infringement or other violation of, any third
                  party rights.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Your Privacy
                </h2>
                <p className="text-muted-foreground">
                  Please read{" "}
                  <a
                    href="/privacy-policy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Reservation of Rights
                </h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to request that you remove all links or
                  any particular link to our Website. You approve to immediately
                  remove all links to our Website upon request. We also reserve
                  the right to amen these terms and conditions and it&apos;s
                  linking policy at any time. By continuously linking to our
                  Website, you agree to be bound to and follow these linking
                  terms and conditions.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Removal of links from our website
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you find any link on our Website that is offensive for any
                  reason, you are free to contact and inform us any moment. We
                  will consider requests to remove links but we are not
                  obligated to or so or to respond to you directly.
                </p>
                <p className="text-muted-foreground">
                  We do not ensure that the information on this website is
                  correct, we do not warrant its completeness or accuracy; nor
                  do we promise to ensure that the website remains available or
                  that the material on the website is kept up to date.
                </p>
              </section>

              <section className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Disclaimer
                </h2>
                <p className="text-muted-foreground mb-4">
                  To the maximum extent permitted by applicable law, we exclude
                  all representations, warranties and conditions relating to our
                  website and the use of this website. Nothing in this
                  disclaimer will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>
                    limit or exclude our or your liability for death or personal
                    injury;
                  </li>
                  <li>
                    limit or exclude our or your liability for fraud or
                    fraudulent misrepresentation;
                  </li>
                  <li>
                    limit any of our or your liabilities in any way that is not
                    permitted under applicable law; or
                  </li>
                  <li>
                    exclude any of our or your liabilities that may not be
                    excluded under applicable law.
                  </li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  The limitations and prohibitions of liability set in this
                  Section and elsewhere in this disclaimer: (a) are subject to
                  the preceding paragraph; and (b) govern all liabilities
                  arising under the disclaimer, including liabilities arising in
                  contract, in tort and for breach of statutory duty.
                </p>
                <p className="text-muted-foreground">
                  As long as the website and the information and services on the
                  website are provided free of charge, we will not be liable for
                  any loss or damage of any nature.
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
