import { Container } from "@/components/shared/Container";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { hasBio, team } from "@/lib/team";

// Surface members with written bios first; "coming soon" members fall to the
// bottom. Stable sort keeps the canonical draft order within each group.
const ordered = [...team].sort(
  (a, b) => Number(hasBio(b)) - Number(hasBio(a)),
);

/** The team roster as a vertical stack of full-width member rows. */
export function TeamGrid() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="team-grid-heading">
      <Container>
        <h2 id="team-grid-heading" className="sr-only">
          Team members
        </h2>
        <ul className="flex flex-col gap-12 sm:gap-16">
          {ordered.map((member, index) => (
            <TeamMemberCard
              key={member.slug}
              member={member}
              divider={index < ordered.length - 1}
            />
          ))}
        </ul>
      </Container>
    </section>
  );
}
