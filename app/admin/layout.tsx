import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { AccountMenu } from "@/components/admin/AccountMenu";
import { Logo } from "@/components/shared/Logo";

// The admin is a back-office tool: it uses much more of the screen than the
// public site's reading-width Container (tables and the two-pane blog editor
// benefit). Header and content share this width so their edges align.
const adminWidth = "mx-auto w-full max-w-[1600px] px-7";

export const metadata: Metadata = {
  title: "RISE admin",
  // The admin surface must never be indexed.
  robots: { index: false, follow: false },
};

// The layout renders shared chrome only; each page guards itself with
// requireAdmin, because a layout is not a reliable place to gate access. The
// nav links are shown by capability for usability; the underlying pages and
// actions still enforce the policy independently.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  const showCycles = admin ? can(admin.role, "manage-cycles") : false;
  const showAdmins = admin ? can(admin.role, "manage-admins") : false;
  const showBlog = admin ? can(admin.role, "manage-blog") : false;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <div className={`${adminWidth} flex flex-wrap items-center gap-x-6 gap-y-3 py-4`}>
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
            {showBlog ? (
              <Link href="/admin/blog" className="hover:text-ink">
                Blog
              </Link>
            ) : null}
            {showCycles ? (
              <Link href="/admin/cycles" className="hover:text-ink">
                Cycles
              </Link>
            ) : null}
            <Link href="/admin/notifications" className="hover:text-ink">
              Notifications
            </Link>
            {showAdmins ? (
              <Link href="/admin/admins" className="hover:text-ink">
                Admins
              </Link>
            ) : null}
          </nav>
          {admin ? (
            <div className="ms-auto">
              <AccountMenu
                name={admin.name}
                role={admin.role}
                canManageAdmins={can(admin.role, "manage-admins")}
              />
            </div>
          ) : null}
        </div>
      </header>
      <main className="py-10">
        <div className={adminWidth}>{children}</div>
      </main>
    </div>
  );
}
