import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

type ImpactHighlightsProps = {
  highlights: string[];
};

/** Foundations of Impact — the 2019 outcomes as a highlight grid. */
export function ImpactHighlights({ highlights }: ImpactHighlightsProps) {
  return (
    <section
      className="bg-surface-sunk/50 py-14 sm:py-18"
      aria-labelledby="impact-highlights-heading"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What it achieved</Eyebrow>
          <h2
            id="impact-highlights-heading"
            className="text-section-title mt-3 text-ink"
          >
            Impact highlights.
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {highlights.map((highlight, index) => (
            <li
              key={highlight}
              className="flex items-start gap-4 rounded-lg border border-line/60 bg-surface p-6 shadow-md"
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl font-extrabold text-evergreen-300"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="leading-relaxed text-slate">{highlight}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
