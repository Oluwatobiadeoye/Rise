import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Button } from "@/components/shared/Button";
import { routes } from "@/lib/site";
import heroPhoto from "@/public/photo-hero.jpg";

/** Home hero — headline, subhead, and the two primary calls to action. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft radial gold glow behind the hero. */}
      <div
        aria-hidden="true"
        className="gold-glow pointer-events-none absolute -right-40 -top-52 size-[620px] rounded-full"
      />
      <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Identify · Develop · Connect</Eyebrow>
          <h1 className="text-display mt-4 text-ink">
            Empowering the next generation of{" "}
            <span className="text-primary">leaders.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate sm:text-xl">
            We connect young people from secondary school through their early
            careers, building leaders, creating opportunity, and strengthening
            our community.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href={routes.projects} size="lg">
              Explore our programmes
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Button>
            <Button href={routes.getInvolved} size="lg" variant="outline">
              Get involved
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] w-full overflow-hidden rounded-lg shadow-lg lg:h-[440px]">
          <Image
            src={heroPhoto}
            alt="Four young people smiling with arms raised in celebration, holding folders"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            placeholder="blur"
            className="object-cover"
          />
          {/* Subtle charcoal scrim from the bottom for grounding and legibility. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-charcoal-900/35 to-transparent"
          />
        </div>
      </Container>
    </section>
  );
}
