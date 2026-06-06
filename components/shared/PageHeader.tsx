import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede?: string;
};

/** Text-led intro band for interior pages (About, Team). Carries the page h1. */
export function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  // Derive a stable, unique heading id from the eyebrow so the section's
  // aria-labelledby never collides if two headers ever share a page.
  const headingId = `${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-heading`;

  return (
    <section
      className="border-b border-line/60 bg-surface-sunk/50 py-14 sm:py-18"
      aria-labelledby={headingId}
    >
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id={headingId} className="text-display mt-3 text-ink">
            {title}
          </h1>
          {lede ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">
              {lede}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
