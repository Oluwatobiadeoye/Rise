import { Sprout } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

type ProjectVisionProps = {
  eyebrow: string;
  title: string;
  body: string;
};

/** Forward-looking statement that connects a project to its long-term place vision. */
export function ProjectVision({ eyebrow, title, body }: ProjectVisionProps) {
  return (
    <section className="py-8 sm:py-10" aria-labelledby="project-vision-heading">
      <Container>
        <div className="bg-ascent relative overflow-hidden rounded-xl px-7 py-10 text-white shadow-lg sm:px-12 sm:py-14">
          <div
            aria-hidden="true"
            className="gold-glow pointer-events-none absolute -right-24 -top-32 size-[360px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-20 size-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-8 size-52 rounded-full border border-white/10"
          />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <Eyebrow tone="gold">{eyebrow}</Eyebrow>
              <h2
                id="project-vision-heading"
                className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl"
              >
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
                {body}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold sm:size-20"
            >
              <Sprout className="size-8 sm:size-10" strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
