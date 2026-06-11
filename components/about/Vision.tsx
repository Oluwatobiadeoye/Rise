import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

const statements: ReadonlyArray<{ label: string; text: string }> = [
  {
    label: "Our vision",
    text: "To build thriving communities where potential is connected to opportunity, leaders of character and competence emerge, and success becomes a catalyst for collective progress.",
  },
  {
    label: "Our mission",
    text: "To identify, develop, connect, and inspire individuals through mentorship, leadership development, and community-driven initiatives that unlock human potential and strengthen communities.",
  },
];

/** About — the vision and mission statements. */
export function Vision() {
  return (
    <section
      className="bg-evergreen-50/60 py-16 sm:py-20"
      aria-labelledby="vision-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="vision-heading" className="sr-only">
            Vision and mission
          </h2>
          <div className="flex flex-col gap-12">
            {statements.map((statement) => (
              <div key={statement.label}>
                <Eyebrow>{statement.label}</Eyebrow>
                <p className="mt-5 font-display text-2xl font-semibold leading-snug text-evergreen-700 sm:text-[1.75rem]">
                  {statement.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
