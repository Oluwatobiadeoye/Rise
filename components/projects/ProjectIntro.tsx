import type { ReactNode } from "react";
import { Container } from "@/components/shared/Container";

type ProjectIntroProps = {
  paragraphs: string[];
  /** Optional kicker above the prose. */
  eyebrow?: ReactNode;
  /** A term to italicise on each occurrence (e.g. a Yoruba name like "Agboole"). */
  emphasize?: string;
};

/** Renders a string into spans, italicising every occurrence of `term`. */
function withEmphasis(text: string, term?: string): ReactNode {
  if (!term) return text;
  const parts = text.split(term);
  if (parts.length === 1) return text;
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? (
        <em className="font-medium text-ink">{term}</em>
      ) : null}
    </span>
  ));
}

/** Detail-page intro: a column of body paragraphs. */
export function ProjectIntro({
  paragraphs,
  eyebrow,
  emphasize,
}: ProjectIntroProps) {
  return (
    <section className="py-14 sm:py-18" aria-labelledby="project-intro-heading">
      <Container>
        <h2 id="project-intro-heading" className="sr-only">
          Overview
        </h2>
        <div className="flex max-w-3xl flex-col gap-5">
          {eyebrow ? (
            <p className="font-body text-[13px] font-bold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-slate">
              {withEmphasis(paragraph, emphasize)}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
