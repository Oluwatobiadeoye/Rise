import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { projects } from "@/lib/projects";
import { routes } from "@/lib/site";

/** About — a concise bridge from the organisation's purpose to its projects. */
export function ProjectsIntro() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="projects-intro-heading">
      <Container>
        <div className="bg-ascent relative overflow-hidden rounded-xl px-7 py-10 text-white shadow-lg sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="gold-glow pointer-events-none absolute -top-40 -right-24 size-[380px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 size-72 rounded-full border border-white/10"
          />

          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
            <div className="max-w-xl">
              <Eyebrow tone="gold">Our projects</Eyebrow>
              <h2
                id="projects-intro-heading"
                className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl"
              >
                Turning purpose into programmes.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/80">
                From the bootcamps that began our journey to Agboolé, our
                long-term pathway for young people, every RISE project turns
                belief into practical opportunity.
              </p>
              <Link
                href={routes.projects}
                className="group mt-7 inline-flex items-center gap-2 font-semibold text-gold transition-colors hover:text-white"
              >
                Explore all projects
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <ul className="grid gap-4">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block rounded-lg border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10 sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                        {project.status === "active" ? "Active" : "Past"} ·{" "}
                        {project.period}
                      </p>
                      <ArrowRight
                        className="size-4 shrink-0 text-gold transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 leading-relaxed text-white/70">
                      {project.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
