import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { content } from "@/lib/content";
import { routes } from "@/lib/site";

const description =
  "Photographs from RISE Initiative programmes: bootcamps, mentorship sessions, and community moments with the young people we serve.";

export const metadata: Metadata = {
  title: "Gallery",
  description,
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery",
    description,
    url: "/gallery",
  },
};

export default async function GalleryPage() {
  const items = await content.listGalleryItems();

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title="Moments from the field."
        lede="A growing album of our programmes in action: classrooms, bootcamps, and the communities we work alongside."
      />

      <section className="py-14 sm:py-18">
        <Container>
          {items.length > 0 ? (
            <GalleryGrid items={items} />
          ) : (
            <EmptyState
              icon={<Camera className="size-6" />}
              title="The album starts soon."
              body="Photographs from our upcoming programmes will appear here. In the meantime, see the photos from our 2019 bootcamps."
              cta={{
                label: "See our past projects",
                href: routes.foundationsOfImpact,
              }}
            />
          )}
        </Container>
      </section>
    </>
  );
}
