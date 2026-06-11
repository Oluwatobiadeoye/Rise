"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const testimonials: ReadonlyArray<{
  quote: string;
  name: string;
  title: string;
  school: string;
}> = [
  {
    quote:
      "My passion for community impact began when RISE Initiative visited my secondary school to teach us about leadership, the Sustainable Development Goals (SDGs), and how young people can create positive change. That experience planted a seed that has continued to shape my journey. I am grateful to RISE Initiative.",
    name: "Timilehin Ayoola",
    title: "Co-Founder, Career Forge Africa",
    school: "Aatan Baptist Comprehensive High School, Oyo",
  },
  {
    quote:
      "Back in secondary school, the programme opened my eyes to the power of community impact and taught me what it means to take responsibility. Today, I realize how deeply important that early foundation was. The bootcamp gave me the early confidence to serve others and lead with purpose and values that continue to drive my work as a youth leader today.",
    name: "Paul Adedeji",
    title: "Millennium Fellowship Scholar & SDG Advocate",
    school: "Aatan Baptist Comprehensive High School, Oyo",
  },
  {
    quote:
      "I recall being part of this enlightenment program, by the RISE Initiative that spoke to us about life, purpose, and intentional living. The details of that day may have faded, but the impression it left has not. It planted a seed, the understanding that success is not accidental, that clarity of purpose is something you pursue deliberately. I can trace a straight line between that early nudge toward purpose and the intentional choices I have made since then.",
    name: "Worship Adeife Adebayo",
    title: "Education & History Student, Obafemi Awolowo University",
    school: "Aatan Baptist Comprehensive High School, Oyo",
  },
];

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
                key={t.name}
                className="w-full flex-shrink-0 px-1"
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
                aria-hidden={i !== current}
              >
                <figure className="flex flex-col rounded-lg border border-line/60 bg-bg p-8 sm:p-10">
                  <Quote
                    className="size-8 text-gold"
                    aria-hidden="true"
                    fill="currentColor"
                  />
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-ink">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6">
                    <span className="block text-sm font-medium text-ink">
                      <span className="font-display font-bold">{t.name}</span>
                      <span className="text-slate"> · {t.title}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-slate">{t.school}</span>
                  </figcaption>
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
      </Container>
    </section>
  );
}
