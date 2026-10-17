import { describe, it, expect } from "vitest";
import { team, hasBio } from "../team";

describe("team roster", () => {
  it("lists the full roster in draft order", () => {
    expect(team.map((m) => m.slug)).toEqual([
      "fareedah-adedeji",
      "oluwadara-adedeji",
      "kunle-oguntoye",
      "ayo-salaudeen",
      "tobi-adeoye",
      "quadri-oseni",
    ]);
  });

  it("gives every member a name and a role", () => {
    for (const member of team) {
      expect(member.name.length).toBeGreaterThan(0);
      expect(member.role.length).toBeGreaterThan(0);
    }
  });

  it("has a bio for every member", () => {
    const withoutBio = team.filter((m) => !hasBio(m)).map((m) => m.slug);
    expect(withoutBio).toEqual([]);
  });

  it("flags Fareedah and Oluwadara as the two co-founders", () => {
    expect(
      team.filter((m) => m.isCoFounder).map((m) => m.slug),
    ).toEqual(["fareedah-adedeji", "oluwadara-adedeji"]);
  });

  it("gives full-bio members a school affiliation", () => {
    for (const member of team) {
      if (hasBio(member)) {
        expect(member.school).toBeTruthy();
      }
    }
  });

  it("uses specific school localities", () => {
    expect(new Set(team.map((member) => member.school))).toEqual(
      new Set([
        "Federal Government Girls' College, Owinni Hill, Sabo, Oyo town, class of 2013.",
        "EACOED Model High School, Isokun Area, Oyo town, class of 2013.",
        "SPED International Secondary School, Akinmorin, class of 2013.",
        "Nesto College, Erelu, Oyo town, class of 2013.",
      ]),
    );
  });
});
