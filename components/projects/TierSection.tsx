import { Check } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Button } from "@/components/shared/Button";
import type { Tier } from "@/lib/projects";

type TierSectionProps = {
  tier: Tier;
  /** Tints alternate rows so adjacent tiers read as distinct bands. */
  tinted?: boolean;
};

/** One TOP programme tier, anchored by its slug for deep-linking. */
export function TierSection({ tier, tinted = false }: TierSectionProps) {
  const headingId = `${tier.slug}-heading`;

  return (
    <section
      id={tier.slug}
      aria-labelledby={headingId}
      // scroll-mt clears the sticky nav when this anchor is followed.
      className={`scroll-mt-24 py-14 sm:py-18 ${tinted ? "bg-surface-sunk/50" : ""}`}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <Eyebrow>{tier.subtitle}</Eyebrow>
            <h3
              id={headingId}
              className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl"
            >
              {tier.name}
            </h3>
            <p className="mt-3 font-semibold text-primary">{tier.audience}</p>

            <div className="mt-6 flex flex-col gap-4">
              {tier.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-slate">
                  {paragraph}
                </p>
              ))}
            </div>

            {tier.cta && tier.cta.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {tier.cta.map((cta, index) => (
                  <Button
                    key={cta.href}
                    href={cta.href}
                    variant={index === 0 ? "primary" : "outline"}
                  >
                    {cta.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:pt-9">
            <p className="font-body text-[13px] font-bold uppercase tracking-[0.16em] text-mist">
              Key focus areas
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {tier.focus.map((area) => (
                <li key={area} className="flex items-start gap-3 text-ink">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-evergreen-50 text-primary"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
