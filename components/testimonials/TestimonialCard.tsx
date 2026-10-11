import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";

/** One testimonial in full: headline, every paragraph, and the attribution. */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li id={testimonial.slug} className="scroll-mt-24">
      <figure className="rounded-lg border border-line/60 bg-surface p-8 sm:p-10">
        <Quote className="size-8 text-gold" aria-hidden="true" fill="currentColor" />
        <blockquote className="mt-4">
          <p className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            &ldquo;{testimonial.headline}&rdquo;
          </p>
          {testimonial.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-lg leading-relaxed text-slate">
              {paragraph}
            </p>
          ))}
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-4 border-t border-line/60 pt-6">
          <Image
            src={testimonial.photo}
            alt={`Portrait of ${testimonial.name}`}
            width={72}
            height={72}
            sizes="72px"
            className="size-[72px] shrink-0 rounded-full object-cover"
          />
          <span>
            <span className="block font-display text-lg font-bold text-ink">
              {testimonial.name}
            </span>
            {testimonial.roles.map((role) => (
              <span key={role} className="block text-sm text-slate">
                {role}
              </span>
            ))}
            <span className="mt-1 block text-sm font-medium text-primary">
              {testimonial.school}
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}
