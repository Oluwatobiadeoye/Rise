"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { logoutAdmin } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import type { AdminRole } from "@/lib/types";

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super admin",
  owner: "Owner",
  reviewer: "Reviewer",
};

/** Up to two initials from a display name, for the avatar fallback. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Admin header account menu: an avatar + name trigger that toggles a dropdown
 * with the signed-in identity and account actions. The first admin-side client
 * component, kept self-contained for an interactive dropdown.
 */
export function AccountMenu({
  name,
  role,
  canManageAdmins,
}: {
  name: string;
  role: AdminRole;
  canManageAdmins: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on outside click and on Escape; return focus to the trigger on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "block w-full rounded-md px-3 py-2 text-start font-body text-sm font-semibold text-charcoal-700 transition-colors hover:bg-surface-sunk focus-visible:bg-surface-sunk focus-visible:outline-none";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill py-1.5 pe-2.5 ps-1.5 font-body text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--rise-line)] transition-colors hover:bg-surface-sunk"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-evergreen-50 font-display text-xs font-bold text-evergreen-700"
        >
          {initials(name)}
        </span>
        <span className="max-w-[12rem] truncate">{name}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute end-0 z-50 mt-2 w-60 rounded-lg border border-line bg-surface p-1.5 shadow-lg"
        >
          <div className="border-b border-line px-3 pb-2 pt-1.5">
            <p className="truncate font-display text-sm font-semibold text-ink">
              {name}
            </p>
            <p className="mt-0.5 font-body text-xs text-muted">
              {ROLE_LABELS[role]}
            </p>
          </div>

          <div className="pt-1.5">
            {canManageAdmins ? (
              <Link
                href="/admin/admins"
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                Manage admins
              </Link>
            ) : null}
            <form action={logoutAdmin}>
              <button type="submit" role="menuitem" className={itemClass}>
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
