import { ImageIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Lightbox } from "@/components/projects/Lightbox";
import type { GallerySchool } from "@/lib/projects";

type ProjectGalleryProps = {
  schools: GallerySchool[];
};

/**
 * School-grouped photo gallery (Server Component). Each school renders its own
 * labelled block; schools without photos yet show a "being prepared" state
 * instead of an empty grid.
 */
export function ProjectGallery({ schools }: ProjectGalleryProps) {
  return (
    <section className="py-14 sm:py-18" aria-labelledby="gallery-heading">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>From the bootcamps</Eyebrow>
          <h2 id="gallery-heading" className="text-section-title mt-3 text-ink">
            Gallery.
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-12">
          {schools.map((school) => {
            const blockId = `gallery-${school.school
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")}`;

            return (
              <section key={school.school} aria-labelledby={blockId}>
                <h3
                  id={blockId}
                  className="font-display text-2xl font-bold text-ink"
                >
                  {school.school}
                </h3>
                {school.location ? (
                  <p className="mt-1 text-slate">{school.location}</p>
                ) : null}

                <div className="mt-5">
                  {school.photos.length > 0 ? (
                    <Lightbox
                      photos={school.photos}
                      label={`Photographs from ${school.school}`}
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-line bg-surface-sunk/40 p-6 text-slate">
                      <ImageIcon
                        className="size-5 shrink-0 text-mist"
                        aria-hidden="true"
                      />
                      <p>Photographs from this school are being prepared.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
