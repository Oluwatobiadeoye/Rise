"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/shared/Nav";
import { Footer } from "@/components/shared/Footer";

/**
 * Wraps page content in the public marketing chrome (skip link, nav, footer),
 * except under /admin, which ships its own self-contained chrome and must not
 * show the public navigation or the "Join the Movement" call to action.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <main id="main" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
