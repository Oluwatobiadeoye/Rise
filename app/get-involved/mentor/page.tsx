import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/shared/Container";
import {
  ApplicationForm,
  type Field,
} from "@/components/get-involved/ApplicationForm";
import { consentField } from "@/components/shared/consent";
import { NotifyMeForm } from "@/components/get-involved/NotifyMeForm";
import { submitMentor } from "@/lib/actions/submissions";
import { sanitizeFromSlug } from "@/lib/from";
import { db } from "@/lib/db";

export const metadata = pageMetadata({
  title: "Apply to mentor",
  description:
    "Become a RISE Initiative mentor and guide a student or young professional in Oyo through career, academic, and personal development support.",
  path: "/get-involved/mentor",
});

// Cycle state lives on disk and must be read on every request.
export const dynamic = "force-dynamic";

const responsibilities = [
  "Meet with your mentee virtually, at least once every two months.",
  "Offer career direction, academic guidance, and personal development support.",
  "Submit brief quarterly updates to the RISE team.",
];

const requirements = [
  "Professional or academic experience in a relevant field.",
  "Strong interpersonal skills.",
  "Willingness to commit to a one-year engagement.",
];

const mentorFields: Field[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "fieldOfExpertise",
    label: "Field of expertise",
    type: "text",
    required: true,
  },
  {
    name: "audiencePreference",
    label: "Who would you like to mentor?",
    type: "select",
    required: true,
    options: [
      { value: "tertiary", label: "Tertiary students" },
      { value: "early-career", label: "Early-career professionals" },
      { value: "either", label: "Open to either" },
    ],
  },
  {
    name: "availability",
    label: "How often can you meet?",
    type: "select",
    required: true,
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "fortnightly", label: "Fortnightly" },
      { value: "flexible", label: "Flexible" },
    ],
  },
  {
    name: "message",
    label: "Short message (optional)",
    type: "textarea",
  },
  consentField("process my application"),
];

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function MentorPage({ searchParams }: PageProps) {
  const [cycles, params] = await Promise.all([db.getCycles(), searchParams]);
  const open = cycles.mentor.open;
  const from = sanitizeFromSlug(params.from);

  return (
    <>
      <PageHeader
        eyebrow="Become a mentor"
        title="Apply to mentor."
        lede="We are looking for passionate professionals ready to give their time to guide a student or young professional in Oyo. Tell us a little about yourself and we will be in touch."
      />

      <section className="py-14 sm:py-18" aria-labelledby="mentor-role-heading">
        <Container>
          <div className="max-w-3xl">
            <h2
              id="mentor-role-heading"
              className="font-display text-2xl font-bold text-ink sm:text-3xl"
            >
              What mentoring involves
            </h2>
            <p className="mt-4 font-body text-[13px] font-bold uppercase tracking-[0.16em] text-slate">
              As a mentor you will
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {responsibilities.map((item) => (
                <li key={item} className="leading-relaxed text-slate">
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 font-body text-[13px] font-bold uppercase tracking-[0.16em] text-slate">
              Requirements
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {requirements.map((item) => (
                <li key={item} className="leading-relaxed text-slate">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section
        className="bg-surface-sunk/50 py-14 sm:py-18"
        aria-labelledby="mentor-form-heading"
      >
        <Container>
          <h2
            id="mentor-form-heading"
            className="mb-8 max-w-2xl font-display text-2xl font-bold text-ink sm:text-3xl"
          >
            Your application
          </h2>
        </Container>
        {open ? (
          <ApplicationForm
            formName="mentor"
            fields={mentorFields}
            submitLabel="Apply to mentor"
            note="Applications are reviewed periodically and only successful applicants will be contacted."
            action={submitMentor}
            from={from}
          />
        ) : (
          <Container>
            <div className="max-w-2xl">
              <div className="rounded-lg border border-line bg-evergreen-50 p-6 text-ink">
                <p className="leading-relaxed">
                  Mentor applications are currently closed. Leave your email
                  and we will let you know when the next cycle opens.
                </p>
              </div>
              <div className="mt-6">
                <NotifyMeForm role="mentor" />
              </div>
            </div>
          </Container>
        )}
      </section>
    </>
  );
}
