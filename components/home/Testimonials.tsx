"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Quote,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { routes } from "@/lib/site";
import { excerptOf, featuredTestimonials } from "@/lib/testimonials";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const testimonials = featuredTestimonials;

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [override, setOverride] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);

  // Auto-advance is opt-out: it never starts for reduced-motion users and
  // stops for good the moment the visitor interacts with the carousel
  // (focus, touch, or any manual navigation). Hovering pauses it transiently.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );
  const autoPlaying = override ?? !prefersReducedMotion;
  const playing = autoPlaying && !hovered;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % testimonials.length);
    }, 10000);
    return () => clearInterval(id);
  }, [playing]);

  // Focus or touch anywhere in the carousel stops rotation, except on the
  // play/pause toggle itself: stopping there would invert the tap that follows.
  const stopAuto = (event?: React.SyntheticEvent) => {
    const target = event?.target;
    if (target instanceof Element && target.closest("[data-carousel-toggle]")) {
      return;
    }
    setOverride(false);
  };
  const goTo = (i: number) => {
    stopAuto();
    setCurrent(i);
  };
  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  return (
    <section
      className="bg-surface py-16 sm:py-20"
      aria-labelledby="testimonials-heading"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Voices</Eyebrow>
          <h2
            id="testimonials-heading"
            className="text-section-title mt-3 text-ink"
          >
            Testimonials from previous bootcamps
          </h2>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={stopAuto}
          onTouchStart={stopAuto}
        >
        <div className="mt-12 relative overflow-hidden">
          <ul
            className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
            aria-live={playing ? "off" : "polite"}
          >
            {testimonials.map((t, i) => (
              <li
                key={t.slug}
                className="w-full flex-shrink-0 px-1"
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
                aria-hidden={i !== current}
                inert={i !== current}
              >
                <figure className="flex h-full flex-col rounded-lg border border-line/60 bg-bg p-8 sm:p-10">
                  <Quote
                    className="size-8 text-gold"
                    aria-hidden="true"
                    fill="currentColor"
                  />
                  <blockquote className="mt-4 flex-1">
                    <p className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                      &ldquo;{t.headline}&rdquo;
                    </p>
                    <p className="mt-4 text-lg leading-relaxed text-slate">
                      {excerptOf(t)}
                    </p>
                  </blockquote>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:flex-nowrap">
                    <figcaption className="flex min-w-0 items-center gap-4">
                      <Image
                        src={t.photo}
                        alt={`Portrait of ${t.name}`}
                        width={56}
                        height={56}
                        sizes="56px"
                        className="size-14 shrink-0 rounded-full object-cover"
                      />
                      <span className="text-sm">
                        <span className="block font-display font-bold text-ink">
                          {t.name}
                        </span>
                        {t.roles.map((role) => (
                          <span key={role} className="block text-slate">
                            {role}
                          </span>
                        ))}
                        <span className="mt-0.5 block text-slate">{t.school}</span>
                      </span>
                    </figcaption>
                    <Link
                      href={`${routes.testimonials}#${t.slug}`}
                      className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-press"
                    >
                      Read full story
                      <span className="sr-only"> from {t.name}</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              data-carousel-toggle
              onClick={() => setOverride(!autoPlaying)}
              aria-label={autoPlaying ? "Pause automatic rotation" : "Resume automatic rotation"}
              className="mr-2 flex size-10 items-center justify-center rounded-full border border-line/60 bg-bg text-ink transition hover:border-evergreen-700 hover:text-evergreen-700"
            >
              {autoPlaying ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
            </button>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-evergreen-700" : "w-2 bg-line"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex size-10 items-center justify-center rounded-full border border-line/60 bg-bg text-ink transition hover:border-evergreen-700 hover:text-evergreen-700"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex size-10 items-center justify-center rounded-full border border-line/60 bg-bg text-ink transition hover:border-evergreen-700 hover:text-evergreen-700"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        </div>

        <Link
          href={routes.testimonials}
          className="mt-8 inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-press"
        >
          More voices of RISE
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
}
