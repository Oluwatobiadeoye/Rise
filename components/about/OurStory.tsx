import Image from "next/image";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import bootcampPhoto from "@/public/projects/foundations-2019/sped/sped-10.jpg";
import aatanPhoto from "@/public/projects/foundations-2019/aatan/aatan-11.jpg";
import bestLegacyPhoto from "@/public/projects/foundations-2019/best-legacy/best-legacy-04.jpg";

const paragraphs = [
  "RISE Initiative was born from a simple but powerful reality: talent is everywhere, but opportunity is not. Across our communities, countless young people possess the ambition, ability, and potential to succeed, yet many lack access to the mentorship, exposure, networks, and support systems that make success attainable. We exist to bridge that gap by ensuring that potential is not limited by circumstance.",
  "Our journey began in 2017 when a group of undergraduate students came together with a shared concern for the future of Oyo. We recognised that our community had produced generations of brilliant minds, yet much of its potential remained untapped due to limited access to opportunities and developmental support. Rather than waiting for change to come through political structures alone, we embraced a simple belief: meaningful societal progress begins when individuals take responsibility for the challenges around them. That conviction became the foundation upon which RISE Initiative was built, and by 2019 it had become action: our first Leadership and Career Development Bootcamps reached more than 600 students across three secondary schools in Oyo.",
  "Over the years, our founders and team members have experienced firsthand the transformative power of access. Through education, mentorship, professional opportunities, and leadership experiences, we have seen how a single opportunity can change the trajectory of a life. Today, RISE Initiative is building pathways that connect talent with opportunity, equip emerging leaders to thrive, and foster a culture where those who benefit from opportunity are empowered to create opportunities for others. We envision a future where access is not determined by circumstance, where talent can flourish regardless of background, and where empowered individuals continuously invest in the growth of their communities. Because the measure of progress is not only how far one person rises, but how many others rise because they did.",
];

const photos = [
  {
    src: bootcampPhoto,
    alt: "Students gathered at the 2019 Career and Leadership Boot Camp at SPED International Secondary School, Oyo.",
  },
  {
    src: aatanPhoto,
    alt: "Students at Aatan Baptist Comprehensive School during the 2019 bootcamp.",
  },
  {
    src: bestLegacyPhoto,
    alt: "Students at Best Legacy College during the 2019 bootcamp.",
  },
];

/** About — the 2017 founding and the 2019 bootcamps. */
export function OurStory() {
  return (
    <section className="py-16 sm:py-20" aria-label="Our story">
      <Container>

        {/* ── Desktop (lg+): text left column, images stacked right ── */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="max-w-xl">
            <Eyebrow>Our story</Eyebrow>
            <h2
              id="our-story-heading"
              className="text-section-title mt-3 text-ink"
            >
              Built on belief in young people.
            </h2>
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-4 text-lg leading-relaxed text-slate first-of-type:mt-5">
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {photos.map((photo) => (
              <Reveal
                key={photo.alt}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Mobile (below lg): heading then paragraph → image pairs ── */}
        <div className="lg:hidden">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="text-section-title mt-3 text-ink">
            Built on belief in young people.
          </h2>

          {paragraphs.map((p, i) => (
            <div key={p.slice(0, 40)}>
              <p className="mt-4 text-lg leading-relaxed text-slate first-of-type:mt-5">
                {p}
              </p>
              <Reveal className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
                <Image
                  src={photos[i].src}
                  alt={photos[i].alt}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </Reveal>
            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}
