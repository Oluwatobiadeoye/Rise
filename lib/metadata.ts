import type { Metadata } from "next";

/**
 * Per-page metadata with OpenGraph derived from the same title/description,
 * so the two can never drift apart.
 *
 * Note: a page-level `openGraph` object replaces the inherited one, which
 * carries the file-based og:image. Any segment using this helper must also
 * re-export the root image (see app/about/opengraph-image.tsx).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · RISE Initiative`,
      description,
      url: path,
    },
  };
}
