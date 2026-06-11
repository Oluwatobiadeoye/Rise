import { Lightbox, type LightboxPhoto } from "@/components/projects/Lightbox";
import type { GalleryItem } from "@/lib/content";

type GalleryGridProps = {
  items: GalleryItem[];
};

/**
 * Responsive photo grid with a fullscreen viewer. Delegates rendering to the
 * shared Lightbox, which lazy-loads thumbnails and sizes them to the grid;
 * each item's intrinsic width and height ride along for the overlay image.
 */
export function GalleryGrid({ items }: GalleryGridProps) {
  const photos: LightboxPhoto[] = items.map((item) => ({
    src: item.src,
    alt: item.caption ? `${item.alt} (${item.caption})` : item.alt,
    width: item.width,
    height: item.height,
  }));

  return <Lightbox photos={photos} label="Gallery photographs" />;
}
