import { Quote } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

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
    school: "Aatan Baptist Comprehensive School, Oyo",
  },
  {
    quote:
      "Back in secondary school, the programme opened my eyes to the power of community impact and taught me what it means to take responsibility. Today,  I realize how deeply important that early foundation was. The bootcamp gave me the early confidence to serve others and lead with purpose and values that continue to drive my work as a youth leader today.",
    name: "Paul Adedeji",
    title: "Millennium Fellowship Scholar & SDG Advocate",
    school: "Aatan Baptist Comprehensive School, Oyo",
  },
];

/** Participant testimonials. */
export function Testimonials() {
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
            Seeds planted early.{" "}
            <em className="font-display font-normal italic text-mist">
              testimonials from our 2019 Bootcamp
            </em>
          </h2>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={t.name} className="h-full">
              <figure className="flex h-full flex-col rounded-lg border border-line/60 bg-bg p-8">
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
      </Container>
    </section>
  );
}
