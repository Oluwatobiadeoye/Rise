import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";

/** One testimonial in full: headline, every paragraph, and the attribution. */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li id={testimonial.slug} className="scroll-mt-24">
      <figure className="grid gap-8 rounded-lg border border-line/60 bg-surface p-6 sm:p-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10 md:p-10">
        <figcaption className="flex items-center gap-5 md:flex-col md:items-start">
          <Image
            src={testimonial.photo}
            alt={`Portrait of ${testimonial.name}`}
            width={180}
            height={180}
            sizes="(min-width: 768px) 180px, (min-width: 640px) 144px, 128px"
            className="h-32 w-32 shrink-0 rounded-full object-cover ring-8 ring-gold-50 sm:h-36 sm:w-36 md:h-[180px] md:w-[180px]"
          />
          <span className="min-w-0 md:pt-1">
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

        <div className="min-w-0 border-t border-line/60 pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
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
        </div>
      </figure>
    </li>
  );
}
