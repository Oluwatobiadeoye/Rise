import { describe, it, expect } from "vitest";
import { team, hasBio } from "../team";

describe("team roster", () => {
  it("lists the full roster in draft order", () => {
    expect(team.map((m) => m.slug)).toEqual([
      "fareedah-adedeji",
      "kunle-oguntoye",
      "ayo-salaudeen",
      "quadri-oseni",
      "tobi-adeoye",
      "oluwadara-adedeji",
    ]);
  });

  it("gives every member a name and a role", () => {
    for (const member of team) {
      expect(member.name.length).toBeGreaterThan(0);
      expect(member.role.length).toBeGreaterThan(0);
    }
  });

  it("flags bio-less members as coming soon", () => {
    const withoutBio = team.filter((m) => !hasBio(m)).map((m) => m.slug);
    expect(withoutBio).toEqual([]);
  });

  it("gives full-bio members a school affiliation", () => {
    for (const member of team) {
      if (hasBio(member)) {
        expect(member.school).toBeTruthy();
      }
    }
  });
});
