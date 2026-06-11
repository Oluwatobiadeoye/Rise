import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { logoutAdmin } from "@/lib/actions/admin";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "RISE admin",
  // The admin surface must never be indexed.
  robots: { index: false, follow: false },
};

// The layout renders shared chrome only; each page guards itself with
// requireAdmin, because a layout is not a reliable place to gate access.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-display text-lg font-bold text-ink"
          >
            <Logo className="size-8" />
            RISE admin
          </Link>
          <nav className="flex items-center gap-5 font-body text-sm font-semibold text-muted">
            <Link href="/admin/submissions" className="hover:text-ink">
              Submissions
            </Link>
            <Link href="/admin" className="hover:text-ink">
              Cycles
            </Link>
          </nav>
          <form action={logoutAdmin} className="ms-auto">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk"
            >
              Log out
            </button>
          </form>
        </Container>
      </header>
      <main className="py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
