import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

const stats: ReadonlyArray<{ value: string; label: string }> = [
  { value: "10,000", label: "Young people empowered — our five-year goal" },
  { value: "3 tiers", label: "Secondary, tertiary & professional" },
  { value: "Since 2017", label: "Identifying and developing young leaders" },
];

/** Ascent-gradient impact band sitting beneath the hero. */
export function ImpactStats() {
  return (
    <section className="py-6 sm:py-10" aria-labelledby="impact-heading">
      <Container>
        <div className="bg-ascent relative overflow-hidden rounded-xl p-8 text-white sm:p-14">
          <div
            aria-hidden="true"
            className="gold-glow pointer-events-none absolute -left-20 -top-28 size-[360px] rounded-full"
          />
          <div className="relative">
            <Eyebrow tone="gold">Our impact</Eyebrow>
            <h2
              id="impact-heading"
              className="text-section-title mt-3 max-w-2xl text-white"
            >
              Building toward lasting impact.
            </h2>

            {/* Horizontal scroll-snap row on narrow screens (visible scrollbar +
                next stat peeking); collapses to a 3-up grid from sm upward. */}
            <dl className="scroll-row mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:pb-0">
              {stats.map((s) => (
                <div
                  key={s.value}
                  className="min-w-[68%] shrink-0 snap-start sm:min-w-0"
                >
                  <dt className="text-stat text-white">{s.value}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-white/80">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
