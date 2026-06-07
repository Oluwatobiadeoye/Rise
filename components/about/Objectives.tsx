import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";

const objectives: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Leadership Development",
    body: "To cultivate leaders of character, competence, and purpose who are equipped to create positive change within their professions, communities, and society.",
  },
  {
    title: "Mentorship and Opportunity Access",
    body: "To expand access to mentorship, networks, information, and opportunities that accelerate personal, educational, and professional growth.",
  },
  {
    title: "Education and Talent Development",
    body: "To support the development of human potential by promoting learning, skills acquisition, critical thinking, and lifelong personal growth.",
  },
  {
    title: "Community Engagement and Service",
    body: "To foster a culture of responsibility, service, and civic participation that encourages individuals to contribute meaningfully to the advancement of their communities.",
  },
  {
    title: "Sustainable Community Transformation",
    body: "To strengthen communities through collaborative initiatives, strategic partnerships, and locally driven solutions that create lasting social and economic impact.",
  },
];

/** About — the five objectives, with the mission's distinctive points folded in. */
export function Objectives() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="objectives-heading">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What we set out to do</Eyebrow>
          <h2
            id="objectives-heading"
            className="text-section-title mt-3 text-ink"
          >
            Our objectives.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2">
          {objectives.map((objective, index) => (
            <li
              key={objective.title}
              className="flex flex-col rounded-lg border border-line/60 bg-surface p-7 shadow-md"
            >
              <span
                aria-hidden="true"
                className="font-display text-3xl font-extrabold text-evergreen-300"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">
                {objective.title}
              </h3>
              <p className="mt-2 leading-relaxed text-slate">{objective.body}</p>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-10 max-w-3xl text-center leading-relaxed text-slate">
          Alongside these, we celebrate and preserve the cultural heritage,
          achievements, and identity of the Oyo community, and we advance the
          United Nations Sustainable Development Goals, particularly Goals 4
          (Quality Education), 10 (Reduced Inequalities), and 11 (Sustainable
          Cities and Communities).
        </p>
      </Container>
    </section>
  );
}
