import { pageMetadata } from "@/lib/metadata";
import { testimonials } from "@/lib/testimonials";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";

export const metadata = pageMetadata({
  title: "Voices of RISE",
  description:
    "Former RISE Initiative boot camp participants share how the experience shaped their studies, careers, and work in their communities.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Voices"
        title="Voices of RISE"
        lede="Students who took part in our boot camps share how the experience shaped where they are today."
      />
      <Container className="py-16 sm:py-20">
        <ul className="mx-auto flex max-w-3xl flex-col gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.slug} testimonial={testimonial} />
          ))}
        </ul>
      </Container>
    </>
  );
}
