import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  /** "primary" (evergreen) on light surfaces; "gold" on dark bands. */
  tone?: "primary" | "gold";
  className?: string;
};

/** Small ALL-CAPS kicker label with wide tracking. */
export function Eyebrow({ children, tone = "primary", className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-body text-[13px] font-bold uppercase tracking-[0.16em]",
        tone === "gold" ? "text-gold" : "text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}
