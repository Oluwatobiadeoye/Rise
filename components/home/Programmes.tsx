import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { routes } from "@/lib/site";

import foundationsImg from "@/public/projects/foundations-2019/sped/sped-09.jpg";
import horizonsImg from "@/public/projects/foundations-2019/sped/sped-01.jpg";
import impactImg from "@/public/projects/foundations-2019/sped/sped-06.jpg";

const programmes: ReadonlyArray<{
  name: string;
  audience: string;
  body: string;
  href: string;
  image: StaticImageData;
  imageAlt: string;
}> = [
  {
    name: "RISE Foundations",
    audience: "Secondary school students",
    body: "Leadership clubs, mentorship, and exam support that build strong foundations for secondary school students.",
    href: routes.riseFoundations,
    image: foundationsImg,
    imageAlt:
      "Secondary school students gathered at a RISE Initiative career and leadership bootcamp.",
  },
  {
    name: "RISE Horizons",
    audience: "Tertiary students",
    body: "Career guidance, scholarship awareness, and mentorship that prepare tertiary students for life after school.",
    href: routes.riseHorizons,
    image: horizonsImg,
    imageAlt:
      "Students seated and engaged during a RISE Initiative career and leadership session.",
  },
  {
    name: "RISE Impact Network",
    audience: "Early-career professionals",
    body: "A professional community sharing mentorship, networking, and the chance to lead and give back.",
    href: routes.riseImpactNetwork,
    image: impactImg,
    imageAlt:
      "A RISE Initiative facilitator speaking into a microphone at a community session.",
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
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={programme.image}
                  alt={programme.imageAlt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  placeholder="blur"
                  className="object-cover object-top"
                />
              </div>
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
