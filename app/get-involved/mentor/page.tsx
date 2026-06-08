import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/shared/Container";
import {
  ApplicationForm,
  type Field,
} from "@/components/get-involved/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply to mentor",
  description:
    "Become a RISE Initiative mentor and guide a student or young professional in Oyo through career, academic, and personal development support.",
  alternates: { canonical: "/get-involved/mentor" },
};

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
    name: "full-name",
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
    name: "field-of-expertise",
    label: "Field of expertise",
    type: "text",
    required: true,
  },
  {
    name: "message",
    label: "Short message",
    type: "textarea",
  },
];

export default function MentorPage() {
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
            <p className="mt-4 font-body text-[13px] font-bold uppercase tracking-[0.16em] text-mist">
              As a mentor you will
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {responsibilities.map((item) => (
                <li key={item} className="leading-relaxed text-slate">
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 font-body text-[13px] font-bold uppercase tracking-[0.16em] text-mist">
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
        <ApplicationForm
          formName="mentor"
          fields={mentorFields}
          submitLabel="Apply to mentor"
          note="Applications are reviewed periodically and only successful applicants will be contacted."
        />
      </section>
    </>
  );
}
