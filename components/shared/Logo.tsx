import { cn } from "@/lib/cn";

type LogoProps = {
  /** "color" = evergreen/emerald/gold chevrons; "mono" = currentColor. */
  tone?: "color" | "mono";
  className?: string;
};

/**
 * The RISE mark — three ascending chevrons rising to a gold apex.
 * Decorative by default (the adjacent wordmark carries the accessible name).
 */
export function Logo({ tone = "color", className }: LogoProps) {
  const strokes =
    tone === "color"
      ? ["var(--rise-evergreen)", "var(--rise-emerald)", "var(--rise-gold)"]
      : ["currentColor", "currentColor", "currentColor"];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-hidden="true"
      className={cn("size-9", className)}
    >
      <path
        d="M18 86 L50 60 L82 86"
        stroke={strokes[0]}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 66 L50 44 L72 66"
        stroke={strokes[1]}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 44 L50 28 L62 44"
        stroke={strokes[2]}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
