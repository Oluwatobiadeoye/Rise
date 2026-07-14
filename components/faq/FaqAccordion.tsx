import { ChevronDown } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { faqs } from "./faqs";

/**
 * Native <details>/<summary> accordion: keyboard-operable and accessible with
 * no client JavaScript. The chevron rotation is a CSS-only effect driven by the
 * group-open variant, so this stays a Server Component.
 */
export function FaqAccordion() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="faq-list-heading">
      <Container>
        <h2 id="faq-list-heading" className="sr-only">
          Answers to questions we hear most
        </h2>

        <ul className="flex max-w-3xl flex-col gap-4">
          {faqs.map((faq) => (
            <li key={faq.question}>
              <details className="group rounded-lg border border-line/60 bg-surface shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-slate">
                  {faq.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
