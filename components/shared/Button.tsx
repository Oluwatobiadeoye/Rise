import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-light"
  | "ghost"
  | "white";
type Size = "md" | "lg";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-body font-semibold leading-none " +
  "transition-[transform,background-color,box-shadow,color] duration-200 ease-out " +
  "active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-evergreen hover:bg-primary-hover",
  secondary: "bg-charcoal text-white hover:bg-charcoal-700",
  outline:
    "bg-transparent text-charcoal shadow-[inset_0_0_0_2px_var(--rise-charcoal)] hover:bg-charcoal hover:text-white",
  "outline-light":
    "bg-transparent text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.55)] hover:bg-white/10",
  ghost: "bg-transparent text-primary hover:text-primary-press",
  white: "bg-white text-charcoal hover:bg-paper",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-[13px] text-[15px]",
  lg: "px-[30px] py-4 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

// Anchor-only attributes that must never appear on the <button> branch, so the
// union genuinely discriminates instead of silently accepting dropped props.
type AnchorOnly = Exclude<
  keyof AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof ButtonHTMLAttributes<HTMLButtonElement>
>;

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
    external?: undefined;
  } & Partial<Record<AnchorOnly, undefined>>;

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & {
    href: string;
    /** External links open in a new tab with a safe rel. */
    external?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLink(props: ButtonProps): props is ButtonAsLink {
  return "href" in props && props.href !== undefined;
}

/**
 * On-brand button. Renders a <button> by default, a Next <Link> for internal
 * hrefs, or an <a> for external ones.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } =
    props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (isLink(props)) {
    const { href, external, ...anchorRest } = rest as {
      href: string;
      external?: boolean;
    } & AnchorHTMLAttributes<HTMLAnchorElement>;

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...anchorRest}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
