import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqs } from "@/components/faq/faqs";
import { routes } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers to common questions about RISE Initiative: mentorship eligibility, joining the Oyo professional community, school partnerships, and our organisational status.",
  path: "/faq",
});

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
      <Container className="pb-16 sm:pb-20">
        <p className="text-slate">
          Still have a question?{" "}
          <Link
            href={routes.contact}
            className="font-semibold text-primary transition-colors hover:text-primary-press"
          >
            Contact us
          </Link>{" "}
          and we will be glad to help.
        </p>
      </Container>
    </>
  );
}
