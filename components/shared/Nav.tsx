"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { navLinks, primaryCta, siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the open mobile menu on Escape (links close it via their onClick).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const elevated = scrolled || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow] duration-200",
        elevated
          ? "bg-paper/85 shadow-[0_1px_0_var(--rise-line)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-[74px] items-center gap-7">
        <Link
          href="/"
          aria-label={`${siteConfig.shortName} home`}
          className="flex items-center gap-3"
        >
          <Logo className="size-9" />
          <span className="font-display text-[23px] font-extrabold leading-none tracking-[-0.03em] text-ink">
            RISE
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="ml-2 hidden lg:flex lg:items-center lg:gap-7"
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "text-[15px] font-medium transition-colors",
                isActive(l.href) ? "text-primary" : "text-slate hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Visibility on the wrapper, not the Button (whose base is inline-flex). */}
          <div className="hidden sm:block">
            <Button href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="size-[17px]" aria-hidden="true" />
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-md text-ink lg:hidden"
          >
            {open ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-line bg-paper/95 backdrop-blur-md lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="py-4">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium",
                  isActive(l.href)
                    ? "bg-primary-tint text-primary"
                    : "text-ink hover:bg-cloud",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Button
              href={primaryCta.href}
              size="lg"
              className="mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              {primaryCta.label}
              <ArrowRight className="size-[17px]" aria-hidden="true" />
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
