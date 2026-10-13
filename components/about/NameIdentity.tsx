import Image from "next/image";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import oyoTown from "@/public/about/oyo-town-owode.jpg";

/** About — what RISE means, the Oyo Project (TOP), and its Yoruba rooting. */
export function NameIdentity() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="name-identity-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:gap-14">
          <div>
            <Eyebrow>Our name and identity</Eyebrow>
            <h2
              id="name-identity-heading"
              className="text-section-title mt-3 text-ink"
            >
              Rooted in Oyo town, rising above limitations.
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate">
              RISE Initiative stands for rising above limitations. Our flagship
              programme, The Oyo Project (TOP), carries a Yoruba identity:{" "}
              <span lang="yo" className="font-semibold text-ink">
                Agboolé
              </span>{" "}
              evokes the compound, the family home, the neighbourhood, the
              shared space where we raise each other. It is a deliberate signal
              that this work is rooted in the culture of Oyo town and committed
              to its people.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-slate">
              Oyo town is a historic community in southwestern Nigeria and one
              of the cultural homes of the Yoruba people. It is where RISE
              Initiative is rooted, and where our work begins.
            </p>
          </div>

          <figure className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute -right-3 -bottom-3 h-full w-full rounded-lg bg-gold/20 sm:-right-4 sm:-bottom-4"
            />
            <div className="relative aspect-[500/351] overflow-hidden rounded-lg border border-line/60 bg-ink shadow-lg">
              <Image
                src={oyoTown}
                alt="A lively street in Oyo town, with local shops, residents, and traffic"
                fill
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 80vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
              />
            </div>
            <figcaption className="relative mt-5 text-sm leading-relaxed text-slate">
              Everyday life along the Owode–Aafin corridor in Oyo town.
              Photograph via{" "}
              <a
                href="https://feedbackoysg.com/ongoing-project-light-up-oyo-installation-of-streetlights-in-oyo-town/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald underline decoration-emerald/30 underline-offset-4 transition-colors hover:text-emerald-600"
              >
                Oyo State Feedback Service
              </a>
              .
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
