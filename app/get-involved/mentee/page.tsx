import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/shared/Container";
import {
  ApplicationForm,
  type Field,
} from "@/components/get-involved/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply for mentorship",
  description:
    "Tertiary students affiliated with Oyo town can apply for a place in the structured RISE Initiative mentorship programme.",
  alternates: { canonical: "/get-involved/mentee" },
};

const eligibility = [
  "Open to tertiary students affiliated with Oyo town.",
  "Applications open periodically, so timing matters.",
  "You will submit a short essay covering your background, goals, and motivation.",
  "Due to limited mentor availability and programme capacity, only successful applicants will be contacted.",
];

const menteeFields: Field[] = [
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
    name: "institution",
    label: "Institution",
    type: "text",
    required: true,
  },
  {
    name: "essay",
    label: "Short essay (your background, goals, and motivation)",
    type: "textarea",
    required: true,
  },
];

export default function MenteePage() {
  return (
    <>
      <PageHeader
        eyebrow="Apply as a mentee"
        title="Apply for mentorship."
        lede="Tertiary students affiliated with Oyo town can apply for a place in our structured mentorship programme. Share your story below and tell us where you want to go."
      />

      <section className="py-14 sm:py-18" aria-labelledby="mentee-role-heading">
        <Container>
          <div className="max-w-3xl">
            <h2
              id="mentee-role-heading"
              className="font-display text-2xl font-bold text-ink sm:text-3xl"
            >
              Before you apply
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {eligibility.map((item) => (
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
        aria-labelledby="mentee-form-heading"
      >
        <Container>
          <h2
            id="mentee-form-heading"
            className="mb-8 max-w-2xl font-display text-2xl font-bold text-ink sm:text-3xl"
          >
            Your application
          </h2>
        </Container>
        <ApplicationForm
          formName="mentee"
          fields={menteeFields}
          submitLabel="Apply for mentorship"
          note="Applications open periodically and only successful applicants will be contacted."
        />
      </section>
    </>
  );
}
