import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Compass,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";

const cards: ReadonlyArray<{
  icon: LucideIcon;
  tint: string;
  title: string;
  body: string;
  href: string;
}> = [
  {
    icon: GraduationCap,
    tint: "bg-evergreen-50 text-evergreen",
    title: "Secondary schools",
    body: "Leadership clubs, an annual bootcamp, and West African Examinations Council (WAEC) and Joint Admissions and Matriculation Board (JAMB) exam support for promising students who need it.",
    href: routes.riseFoundations,
  },
  {
    icon: Compass,
    tint: "bg-emerald-50 text-emerald-600",
    title: "Tertiary students",
    body: "Career webinars, scholarship guidance, and a structured mentorship programme that pairs students with experienced professionals.",
    href: routes.riseHorizons,
  },
  {
    icon: Briefcase,
    tint: "bg-gold-50 text-gold-600",
    title: "Early-career professionals",
    body: "Curriculum Vitae (CV) and LinkedIn support, a professional community, mentorship, and networking across industries.",
    href: routes.riseImpactNetwork,
  },
];

/** "What We Do" — the three programme tiers, mission-level. */
export function WhatWeDo() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="what-we-do-heading">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What we do</Eyebrow>
          <h2 id="what-we-do-heading" className="text-section-title mt-3 text-ink">
            Three stages, one journey.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate">
            We walk with young people from secondary school into their
            professional lives, supported at every step.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <li
                key={card.title}
                className="group flex flex-col rounded-lg border border-line/60 bg-surface p-8 shadow-md transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className={cn(
                    "grid size-13 place-items-center rounded-[16px]",
                    card.tint,
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                  {card.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-slate">{card.body}</p>
                <Link
                  href={card.href}
                  className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 font-semibold text-primary transition-colors hover:text-primary-press"
                >
                  Find out more
                  <span className="sr-only"> about {card.title}</span>
                  <ArrowRight
                    className="size-[15px] transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
