import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

/** About — what RISE means, the Oyo Project (TOP), and its Yoruba rooting. */
export function NameIdentity() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="name-identity-heading">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>Our name and identity</Eyebrow>
          <h2
            id="name-identity-heading"
            className="text-section-title mt-3 text-ink"
          >
            Rooted in Oyo, rising above limitations.
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-slate">
            RISE Initiative stands for rising above limitations. Our flagship
            programme, The Oyo Project (TOP), carries a Yoruba identity:{" "}
            <span lang="yo" className="font-semibold text-ink">
              Agboole
            </span>{" "}
            evokes the compound, the family home, the neighbourhood, the shared
            space where we raise each other. It is a deliberate signal that this
            work is rooted in Oyo culture and committed to its people.
          </p>

          <p className="mt-4 text-lg leading-relaxed text-slate">
            Oyo is a historic town in southwestern Nigeria and one of the
            cultural homes of the Yoruba people. It is where RISE Initiative is
            rooted, and where our work begins.
          </p>
        </div>
      </Container>
    </section>
  );
}
