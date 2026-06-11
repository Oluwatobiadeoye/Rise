import type { ReactNode } from "react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Button } from "@/components/shared/Button";

type RoleSectionProps = {
  /** When present, anchors the section for deep-linking and adds sticky-nav clearance. */
  id?: string;
  /** Tints alternate rows so adjacent sections read as distinct bands. */
  tinted?: boolean;
  eyebrow: string;
  title: string;
  body: string[];
  /** Primary call to action rendered as a link. */
  cta?: { label: string; href: string };
  /** Renders a disabled placeholder action instead of a working CTA. */
  disabledCta?: boolean;
  /** Helper text shown beside the action (e.g. a "coming soon" note). */
  ctaNote?: string;
  /** A working fallback link rendered when the primary action is disabled. */
  ctaHref?: string;
  /** Accessible label for the disabled placeholder button. */
  disabledLabel?: string;
  /** Label for the fallback link. */
  fallbackLabel?: string;
  /** Extra content (e.g. an embedded form) rendered after the copy and actions. */
  children?: ReactNode;
};

/** One "Get involved" role block: copy plus an action. */
export function RoleSection({
  id,
  tinted = false,
  eyebrow,
  title,
  body,
  cta,
  disabledCta = false,
  ctaNote,
  ctaHref,
  disabledLabel,
  fallbackLabel,
  children,
}: RoleSectionProps) {
  const headingId = `${(id ?? title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-heading`;

  return (
    <section
      {...(id ? { id } : {})}
      aria-labelledby={headingId}
      className={`py-14 sm:py-18 ${id ? "scroll-mt-24" : ""} ${
        tinted ? "bg-surface-sunk/50" : ""
      }`}
    >
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2
            id={headingId}
            className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            {title}
          </h2>

          <div className="mt-6 flex flex-col gap-4">
            {body.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-slate">
                {paragraph}
              </p>
            ))}
          </div>

          {disabledCta ? (
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <Button type="button" disabled>
                  {disabledLabel ?? "Donate"}
                </Button>
                {ctaNote ? (
                  <p className="text-sm text-slate">{ctaNote}</p>
                ) : null}
              </div>
              {ctaHref ? (
                <Button href={ctaHref} variant="ghost" external>
                  {fallbackLabel ?? "Email us"}
                </Button>
              ) : null}
            </div>
          ) : cta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={cta.href}>{cta.label}</Button>
            </div>
          ) : null}
        </div>
      </Container>

      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}
