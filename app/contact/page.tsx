import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { routes } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with RISE Initiative. Reach our team about general enquiries, partnerships, the mentorship programme, or media, or send us a message directly.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch."
        lede="Whether you are a school, partner organisation, potential donor, or community member who wants to learn more, we would love to hear from you."
      />
      <Container className="py-16 sm:py-20">
        <p className="mb-10 text-slate">
          Looking for a quick answer? Check our{" "}
          <Link
            href={routes.faq}
            className="font-semibold text-primary transition-colors hover:text-primary-press"
          >
            frequently asked questions
          </Link>
          .
        </p>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <ContactDetails />
          <ContactForm />
        </div>
      </Container>
    </>
  );
}
