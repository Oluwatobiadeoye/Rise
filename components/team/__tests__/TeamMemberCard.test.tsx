import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamMemberCard } from "../TeamMemberCard";
import { team } from "@/lib/team";

const bySlug = (slug: string) => {
  const member = team.find((m) => m.slug === slug);
  if (!member) throw new Error(`missing fixture: ${slug}`);
  return member;
};

describe("TeamMemberCard", () => {
  it("renders a full bio with the school affiliation woven in", () => {
    render(<TeamMemberCard member={bySlug("fareedah-adedeji")} />);
    expect(
      screen.getByRole("heading", { name: "Eyitayo Fareedah Adedeji" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Operations Manager at Access Bank/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Federal Government Girls' College, Owinni Hill, Sabo/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it("marks a co-founder with the Co-Founder chip", () => {
    render(<TeamMemberCard member={bySlug("fareedah-adedeji")} />);
    expect(screen.getByText("Co-Founder")).toBeInTheDocument();
  });

  it("omits the Co-Founder chip for members who are not co-founders", () => {
    render(<TeamMemberCard member={bySlug("tobi-adeoye")} />);
    expect(screen.queryByText("Co-Founder")).not.toBeInTheDocument();
  });

  it("renders a coming-soon shell with no bio prose", () => {
    render(
      <TeamMemberCard
        member={{ slug: "pending", name: "Pending Member", role: "Director" }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Pending Member" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Full bio coming soon/i)).toBeInTheDocument();
    expect(screen.queryByText(/Access Bank/i)).not.toBeInTheDocument();
  });
});
