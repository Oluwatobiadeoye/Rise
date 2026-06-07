import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

const statements: ReadonlyArray<string> = [
  "To build thriving communities where potential is connected to opportunity, leaders of character and competence emerge, and success becomes a catalyst for collective progress.",
];

/** About — the vision statement(s). */
export function Vision() {
  return (
    <section
      className="bg-evergreen-50/60 py-16 sm:py-20"
      aria-labelledby="vision-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our vision</Eyebrow>
          <h2 id="vision-heading" className="text-section-title mt-3 text-ink">
            Where we are headed.
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {statements.map((statement) => (
              <p
                key={statement}
                className="font-display text-2xl font-semibold leading-snug text-evergreen-700 sm:text-[1.75rem]"
              >
                {statement}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
