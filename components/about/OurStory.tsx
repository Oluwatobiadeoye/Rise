import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

/** About — the 2017 founding and the 2019 bootcamps. */
export function OurStory() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="our-story-heading">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <Eyebrow>Our story</Eyebrow>
            <h2
              id="our-story-heading"
              className="text-section-title mt-3 text-ink"
            >
              Built on belief in young people.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate">
              In 2017, RISE Initiative was founded out of a shared commitment to
              empowering young people to realise their potential, overcome
              challenges, and contribute meaningfully to their communities.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              In 2019, we delivered leadership and Sustainable Development Goals
              (SDG) bootcamps across three secondary schools in Oyo town,
              reaching and impacting over 600 students.
            </p>
          </div>

          <ImagePlaceholder
            label="2019 leadership bootcamp, Oyo"
            className="aspect-[4/3] w-full shadow-md"
          />
        </div>
      </Container>
    </section>
  );
}
