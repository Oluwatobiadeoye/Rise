import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { routes } from "@/lib/site";

/** About — short team introduction linking to the Team page. */
export function TeamIntro() {
  return (
    <section className="py-16 sm:py-20" aria-label="Our team">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our team</Eyebrow>
          <h2 className="text-section-title mt-3 text-ink">
            The people behind RISE.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            RISE Initiative is led by an operational team of young
            professionals who grew up with the same realities our programmes
            address. They bring experience across education, technology,
            healthcare, and community development, and they share one
            conviction: opportunity should not depend on circumstance.
          </p>
          <Link
            href={routes.team}
            className="mt-7 inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-press"
          >
            Meet the team
            <ArrowRight className="size-[16px]" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
