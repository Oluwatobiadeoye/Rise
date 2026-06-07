import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { socialIcons } from "./icons";
import { routes, siteConfig, socials } from "@/lib/site";

const columns: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    title: "Programmes",
    links: [
      { label: "RISE Foundations", href: routes.riseFoundations },
      { label: "RISE Horizons", href: routes.riseHorizons },
      { label: "RISE Impact Network", href: routes.riseImpactNetwork },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Become a mentor", href: routes.mentor },
      { label: "Apply as a mentee", href: routes.mentee },
      { label: "Volunteer", href: routes.volunteer },
      { label: "Support a student", href: routes.supportAStudent },
    ],
  },
  {
    title: "Organisation",
    links: [
      { label: "About", href: routes.about },
      { label: "Our team", href: routes.team },
      { label: "Contact", href: routes.contact },
      { label: "FAQ", href: routes.faq },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-charcoal-900 text-white/70">
      <Container className="py-16">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label={`${siteConfig.shortName} home`}
              className="flex items-center gap-3"
            >
              <Logo className="size-10" />
              <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                RISE
              </span>
            </Link>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/65">
              Identify, develop, and connect young people through leadership,
              mentorship, and access to opportunities.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-display text-sm font-semibold text-white">
                {col.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse items-start gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/55">
            © {year} RISE Initiative. Rising Above Limitations.
          </p>
          <ul className="flex gap-2.5">
            {socials.map((s) => {
              const Icon = socialIcons[s.key];
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
