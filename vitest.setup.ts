import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees and reset the DOM between tests.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia; components query it for reduced motion.
// Guarded because filesystem suites opt into the node environment (no window).
if (typeof window !== "undefined") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

// Render next/link as a plain anchor in unit tests (no router runtime needed).
vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({
      href,
      children,
      ...props
    }: {
      href: string | { pathname?: string };
      children: React.ReactNode;
    } & Record<string, unknown>) =>
      createElement(
        "a",
        { href: typeof href === "string" ? href : (href?.pathname ?? "#"), ...props },
        children,
      ),
  };
});

// Render next/image as a plain <img> in unit tests. Vitest doesn't run Next's
// image loader, so static imports resolve to a path string and blur/fill/priority
// props aren't valid on a bare <img> — strip them and normalise the src.
vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: ({
      src,
      alt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fill,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      priority,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      placeholder,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      blurDataURL,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sizes,
      ...props
    }: {
      src: string | { src: string };
      alt?: string;
    } & Record<string, unknown>) =>
      createElement("img", {
        src: typeof src === "string" ? src : src?.src,
        alt: alt ?? "",
        ...props,
      }),
  };
});

// Stub the App Router navigation hooks our client components read.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
