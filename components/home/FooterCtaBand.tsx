import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import { routes } from "@/lib/site";

/** Closing call-to-action band routing to the mentee, mentor, and support pages. */
export function FooterCtaBand() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="cta-heading">
      <Container>
        <div className="relative overflow-hidden rounded-xl bg-primary px-8 py-14 text-center text-white sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="gold-glow pointer-events-none absolute -right-16 -top-24 size-[360px] rounded-full"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="cta-heading" className="text-section-title text-white">
              Ready to grow with us?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              Want to learn, lead, or lift others up? There is a place for you
              here.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href={routes.mentee} variant="white" size="lg">
                Apply as a mentee
                <ArrowRight className="size-[18px]" aria-hidden="true" />
              </Button>
              <Button href={routes.mentor} variant="outline-light" size="lg">
                Become a mentor
              </Button>
              <Button
                href={routes.supportAStudent}
                variant="outline-light"
                size="lg"
              >
                Support a student
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
