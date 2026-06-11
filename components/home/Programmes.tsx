import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { routes } from "@/lib/site";

const programmes: ReadonlyArray<{
  name: string;
  audience: string;
  body: string;
  href: string;
  image: string;
}> = [
  {
    name: "RISE Foundations",
    audience: "Secondary school students",
    body: "Leadership clubs, mentorship, and exam support that help secondary school students build strong foundations and broaden their aspirations.",
    href: routes.riseFoundations,
    image: "Secondary school students at a RISE Foundations leadership session",
  },
  {
    name: "RISE Horizons",
    audience: "Tertiary students",
    body: "Career guidance, scholarship awareness, and structured mentorship that prepare tertiary students for life after school.",
    href: routes.riseHorizons,
    image: "Tertiary students at a RISE Horizons mentorship meeting",
  },
  {
    name: "RISE Impact Network",
    audience: "Early-career professionals",
    body: "A growing community of professionals sharing mentorship, networking, and opportunities to lead and give back.",
    href: routes.riseImpactNetwork,
    image: "Professionals connecting at a RISE Impact Network event",
  },
];

/** Home — the three programme tiers as a row of cards. */
export function Programmes() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="programmes-heading">
      <Container>
        <div className="max-w-2xl">
          <h2 id="programmes-heading" className="text-section-title text-ink">
            Our programmes
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-slate">
            Three pathways. One mission. Limitless impact.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {programmes.map((programme) => (
            <li
              key={programme.name}
              className="group flex flex-col overflow-hidden rounded-lg border border-line/60 bg-surface shadow-md transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
            >
              <ImagePlaceholder
                label={programme.image}
                rounded="rounded-none"
                className="aspect-[16/9] w-full"
              />
              <div className="flex flex-1 flex-col p-6">
                <p className="font-body text-[13px] font-bold uppercase tracking-[0.16em] text-slate">
                  {programme.audience}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                  {programme.name}
                </h3>
                <p className="mt-2.5 leading-relaxed text-slate">
                  {programme.body}
                </p>
                <Link
                  href={programme.href}
                  className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 font-semibold text-primary transition-colors hover:text-primary-press"
                >
                  Explore {programme.name}
                  <ArrowRight
                    className="size-[15px] transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
