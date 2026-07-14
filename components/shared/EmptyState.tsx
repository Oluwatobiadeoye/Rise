import type { ReactNode } from "react";
import { Button } from "@/components/shared/Button";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

/**
 * On-brand placeholder for sections whose content has not arrived yet. Sits
 * inside the page body; the page keeps its own header around it.
 */
export function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-surface-sunk/40 px-6 py-16 text-center sm:py-20">
      {icon ? (
        <div
          className="grid size-14 place-items-center rounded-full bg-evergreen-50 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h2 className="font-display mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-md leading-relaxed text-slate">{body}</p>
      {cta ? (
        <Button href={cta.href} className="mt-7">
          {cta.label}
        </Button>
      ) : null}
    </div>
  );
}
