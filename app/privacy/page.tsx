import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { contactEmails, routes } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How RISE Initiative collects, uses, stores, and protects the information you share through our forms, including how we handle data from applicants who are under 18.",
  path: "/privacy",
});

const LAST_UPDATED = "June 2026";

const formData: ReadonlyArray<{ form: string; collects: string }> = [
  {
    form: "Contact form",
    collects: "your name, email address, who you are, and your message.",
  },
  {
    form: "Mentor application",
    collects:
      "your name, email address, field of expertise, who you would like to mentor, your availability, and an optional message.",
  },
  {
    form: "Mentee application",
    collects:
      "your name, email address, institution, date of birth, and a short essay about your background, goals, and motivation.",
  },
  {
    form: "Volunteer interest form",
    collects:
      "your name, email address, your area of interest, and an optional message.",
  },
  {
    form: "Notify me list",
    collects:
      "your email address and the role (mentor or mentee) you asked to be told about.",
  },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 first:mt-0">
      <h2
        id={id}
        className="font-display text-2xl font-bold text-ink sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 leading-relaxed text-slate">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy policy."
        lede="This policy explains what information RISE Initiative collects through this website, why we collect it, how we keep it safe, and the choices you have. We have written it in plain language so it is easy to follow."
      />

      <Container className="py-14 sm:py-18">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
            Last updated: {LAST_UPDATED}
          </p>

          <Section id="who-we-are" title="Who we are">
            <p>
              RISE Initiative (&ldquo;RISE&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;) is a youth leadership organisation based in Oyo,
              Nigeria. We are responsible for the information you share with us
              through this website. If you have any questions about this policy
              or about your information, you can reach us at the address in the{" "}
              <Link
                href="#data-requests"
                className="font-semibold text-primary transition-colors hover:text-primary-press"
              >
                contacting us about your data
              </Link>{" "}
              section below.
            </p>
          </Section>

          <Section id="what-we-collect" title="What information we collect">
            <p>
              We only collect the information you choose to give us when you fill
              in one of our forms. We do not buy or rent personal information
              from anyone else. Here is what each form collects:
            </p>
            <ul className="flex flex-col gap-3">
              {formData.map((entry) => (
                <li key={entry.form}>
                  <span className="font-semibold text-ink">{entry.form}:</span>{" "}
                  {entry.collects}
                </li>
              ))}
            </ul>
            <p>
              Every form also includes a hidden field that helps us catch
              automated spam. It is never shown to you and collects no personal
              information.
            </p>
          </Section>

          <Section id="how-we-use-it" title="How we use your information">
            <p>
              We use the information you send us to respond to your enquiry, to
              review and process your application, or to add you to the
              &ldquo;notify me&rdquo; list so we can tell you when the next
              application cycle opens. When you submit a form, a notification is
              sent to the RISE team so that someone can follow up with you.
            </p>
            <p>
              We do not use your information for advertising, and we do not sell
              it or share it with third parties for their own marketing.
            </p>
          </Section>

          <Section
            id="lawful-basis"
            title="Our lawful basis under the Nigeria Data Protection Act 2023"
          >
            <p>
              We process your information under the Nigeria Data Protection Act
              2023 (NDPA). Our lawful basis is your consent: you give it by
              ticking the consent box on each form before you submit it. Because
              the basis is consent, you are free to withdraw it at any time by
              contacting us, and we will stop processing and delete your
              information unless we are required to keep it for a legal reason.
            </p>
          </Section>

          <Section
            id="applicants-under-18"
            title="How we handle data from applicants under 18"
          >
            <p>
              Mentoring through RISE is aimed at tertiary students and young
              professionals, who are usually adults. However, the mentee
              application form asks for your date of birth, and some tertiary
              students in Nigeria are under 18.
            </p>
            <p>
              If an applicant is both under 18 and accepted onto the programme,
              we obtain sign-off from their parent or guardian before any
              mentor matching takes place. This guardian consent is handled by
              our team offline, in person at onboarding, and not through this
              website. No under-18 applicant is matched with a mentor until that
              consent has been given. If an under-18 applicant is not accepted
              or does not progress, their information is deleted in line with the
              retention periods below.
            </p>
          </Section>

          <Section id="how-we-store-it" title="How we store and protect your information">
            <p>
              Submissions are stored securely on our servers. Access is
              restricted to members of the RISE team who need it to do their
              work, and the keys that protect the data are never exposed to your
              browser or to the public. We keep backups so that a submission is
              not lost.
            </p>
          </Section>

          <Section id="cookies-analytics" title="Cookies and analytics">
            <p>
              This website uses privacy friendly, cookieless analytics. That
              means we can see broad, anonymous patterns such as which pages are
              popular, but we do not set tracking cookies, we do not build a
              profile of you, and we cannot identify you from the analytics. For
              that reason you will not see a cookie consent banner on this site.
            </p>
          </Section>

          <Section id="retention" title="How long we keep your information">
            <p>
              We keep application and enquiry submissions for up to 24 months
              from the date you send them, so that we can manage the application
              cycle and follow up where appropriate. Successful applicants&rsquo;
              details may be kept for the duration of their time on the
              programme.
            </p>
            <p>
              We keep the &ldquo;notify me&rdquo; list until the relevant cycle
              opens and we have contacted you, or for up to 12 months, whichever
              comes first, after which we remove your email from the list. You
              can ask to be removed at any time.
            </p>
            <p>
              The information of an applicant who is under 18 and does not
              progress onto the programme is deleted promptly, and we treat
              requests to delete a minor&rsquo;s data as a priority.
            </p>
          </Section>

          <Section id="your-rights" title="Your rights">
            <p>
              Under the Nigeria Data Protection Act 2023 you have the right to
              ask us for a copy of the information we hold about you, to ask us
              to correct it if it is wrong, to ask us to delete it, and to
              withdraw your consent. To use any of these rights, contact us using
              the details below and we will respond as soon as we reasonably can.
            </p>
          </Section>

          <Section id="data-requests" title="Contacting us about your data">
            <p>
              To ask a question about this policy, to make a data request, or to
              ask us to delete your information, email us at{" "}
              <a
                href={`mailto:${contactEmails.general}`}
                className="font-semibold text-primary transition-colors hover:text-primary-press"
              >
                {contactEmails.general}
              </a>{" "}
              or use our{" "}
              <Link
                href={routes.contact}
                className="font-semibold text-primary transition-colors hover:text-primary-press"
              >
                contact page
              </Link>
              . Please tell us which information your request is about so we can
              find it quickly.
            </p>
          </Section>

          <Section id="changes" title="Changes to this policy">
            <p>
              We may update this policy from time to time as our work and our
              tools change. When we do, we will update the date at the top of
              this page. We encourage you to check back occasionally so you stay
              informed about how we look after your information.
            </p>
          </Section>
        </div>
      </Container>
    </>
  );
}
