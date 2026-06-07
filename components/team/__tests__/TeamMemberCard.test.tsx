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
      screen.getByText(/Federal Government Girls College Owinni/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it("renders kunle's card with name and role", () => {
    render(<TeamMemberCard member={bySlug("kunle-oguntoye")} />);
    expect(
      screen.getByRole("heading", { name: "Kunle Oguntoye" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Full bio coming soon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Access Bank/i)).not.toBeInTheDocument();
  });
});
