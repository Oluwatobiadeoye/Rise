import {
  Award,
  HeartHandshake,
  ShieldCheck,
  Sprout,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { cn } from "@/lib/cn";

// Resilience, Integrity, Service, Excellence lead so the initials read in
// sequence; Collaboration and Impact follow. All cards share one design.
const values: ReadonlyArray<{
  icon: LucideIcon;
  tint: string;
  title: string;
  body: string;
}> = [
  {
    icon: Sprout,
    tint: "bg-emerald-50 text-emerald-600",
    title: "Resilience",
    body: "We embrace challenges as opportunities for growth and remain steadfast in the pursuit of our goals. We believe resilience is the foundation of personal development, leadership, and lasting impact.",
  },
  {
    icon: ShieldCheck,
    tint: "bg-gold-50 text-gold-600",
    title: "Integrity",
    body: "We uphold the highest standards of honesty, accountability, and ethical conduct. We are committed to doing what is right, building trust, and leading by example in all that we do.",
  },
  {
    icon: HeartHandshake,
    tint: "bg-emerald-50 text-emerald-600",
    title: "Service",
    body: "We believe that success carries a responsibility to uplift others. We are committed to creating opportunities, supporting communities, and contributing meaningfully to the common good.",
  },
  {
    icon: Award,
    tint: "bg-gold-50 text-gold-600",
    title: "Excellence",
    body: "We pursue the highest standards in our work, leadership, and impact. We strive for continuous improvement and encourage individuals to realise their fullest potential.",
  },
  {
    icon: Users,
    tint: "bg-emerald-50 text-emerald-600",
    title: "Collaboration",
    body: "We recognise that meaningful change is achieved through partnership, shared knowledge, and collective action. We value diverse perspectives and believe we are stronger when we work together.",
  },
  {
    icon: Target,
    tint: "bg-gold-50 text-gold-600",
    title: "Impact",
    body: "We are committed to creating measurable and sustainable change. Every programme, partnership, and initiative is designed to generate lasting value for individuals and communities.",
  },
];

/** About — the six values. The first four open with the letters of our name. */
export function Values() {
  return (
    <section
      className="bg-surface-sunk/40 py-16 sm:py-20"
      aria-labelledby="values-heading"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Our values</Eyebrow>
          <h2 id="values-heading" className="text-section-title mt-3 text-ink">
            What we stand for.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate">
            The first four begin with the letters of our name; together, all six
            guide how we work.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <li
                key={value.title}
                className="flex flex-col rounded-lg border border-line/60 bg-surface p-8 shadow-md"
              >
                <span
                  className={cn(
                    "grid size-13 place-items-center rounded-[16px]",
                    value.tint,
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                  {value.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-slate">{value.body}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
