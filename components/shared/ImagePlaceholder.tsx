import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  /** Describes the intended photo; also the accessible name. */
  label: string;
  /** Sizing / aspect utilities (e.g. "h-[440px]", "aspect-[4/3]"). */
  className?: string;
  /** Corner-rounding utility. Defaults to a rounded rectangle; pass
   *  "rounded-full" for circular media. Kept explicit so the shape is
   *  deterministic rather than relying on className ordering. */
  rounded?: string;
};

/** On-brand stand-in for real photography until photos are supplied. */
export function ImagePlaceholder({
  label,
  className,
  rounded = "rounded-lg",
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        rounded,
        "border-2 border-dashed border-charcoal/20 text-slate",
        "bg-[linear-gradient(135deg,#EAE4D8,#DCD3C4)]",
        className,
      )}
    >
      <div className="flex max-w-[80%] flex-col items-center gap-2 text-center">
        <ImageIcon className="size-8 opacity-50" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.06em] opacity-70">
          {label}
        </span>
      </div>
    </div>
  );
}
