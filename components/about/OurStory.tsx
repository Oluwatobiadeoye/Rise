import Image from "next/image";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import bootcampPhoto from "@/public/projects/foundations-2019/sped/sped-10.jpg";
import aatanPhoto from "@/public/projects/foundations-2019/aatan/aatan-11.jpg";
import bestLegacyPhoto from "@/public/projects/foundations-2019/best-legacy/best-legacy-04.jpg";

/** About — the 2017 founding and the 2019 bootcamps. */
export function OurStory() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="our-story-heading">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <Eyebrow>Our story</Eyebrow>
            <h2
              id="our-story-heading"
              className="text-section-title mt-3 text-ink"
            >
              Built on belief in young people.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate">
            RISE Initiative was born from a simple but powerful reality: talent is everywhere, 
            but opportunity is not. Across our communities, countless young people possess the ambition, 
            ability, and potential to succeed, yet many lack access to the mentorship, exposure, networks,
             and support systems that make success attainable. We exist to bridge that gap by ensuring that potential
              is not limited by circumstance.

            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate">
            Our journey began in 2017 when a group of undergraduate students came together with a shared concern for the future of Oyo. 
            We recognized that our community had produced generations of brilliant minds, yet much of its potential remained untapped due to 
            limited access to opportunities and developmental support. Rather than waiting for change to come through political 
            structures alone, we embraced a simple belief: meaningful societal progress begins when individuals 
            take responsibility for the challenges around them. That conviction became the foundation upon which RISE Initiative was built.

            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate">
            Over the years, our founders and team members have experienced firsthand the transformative power of access. Through education, mentorship, 
            professional opportunities, and leadership experiences, we have seen how a single opportunity can change the trajectory of a life. 
            Today, RISE Initiative is building pathways that connect talent with opportunity, equip emerging leaders to thrive, 
            and foster a culture where those who benefit from opportunity are empowered to create opportunities for others. 
            We envision a future where access is not determined by circumstance, where talent can flourish 
            regardless of background, and where empowered individuals continuously invest in the growth of their communities. 
            Because the measure of progress is not only how far one person rises, but how many others rise because they did.

            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src={bootcampPhoto}
                alt="Students gathered at the 2019 Career and Leadership Boot Camp at SPED International Secondary School, Oyo."
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </Reveal>
            <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src={aatanPhoto}
                alt="Students at Aatan Baptist Comprehensive School during the 2019 bootcamp."
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </Reveal>
            <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src={bestLegacyPhoto}
                alt="Students at Best Legacy College during the 2019 bootcamp."
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
