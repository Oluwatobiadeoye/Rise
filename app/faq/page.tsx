import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqs } from "@/components/faq/faqs";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers to common questions about RISE Initiative: mentorship eligibility, joining the Oyo professional community, school partnerships, and our organisational status.",
  alternates: { canonical: "/faq" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.plainText,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        lede="Quick answers about our programmes and how to get involved. If your question is not covered here, reach out and we will be glad to help."
      />
      <FaqAccordion />
    </>
  );
}
