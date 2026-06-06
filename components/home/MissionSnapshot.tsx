import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { routes } from "@/lib/site";

/** Short mission paragraph + link to Our Story. */
export function MissionSnapshot() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="mission-heading">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our mission</Eyebrow>
          <p
            id="mission-heading"
            className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl"
          >
            RISE Initiative exists to identify, develop, connect, and inspire
            individuals through mentorship, leadership development, and
            community-driven initiatives that unlock human potential and
            strengthen communities.
          </p>
          <Link
            href={routes.about}
            className="mt-7 inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-press"
          >
            Our story
            <ArrowRight className="size-[16px]" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
