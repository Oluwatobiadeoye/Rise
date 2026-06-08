import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierSection } from "../TierSection";
import { getProject, type Tier } from "@/lib/projects";

const tiers = getProject("the-oyo-project")!.tiers as Tier[];
const horizons = tiers.find((t) => t.slug === "rise-horizons")!;
const network = tiers.find((t) => t.slug === "rise-impact-network")!;

describe("TierSection", () => {
  it("renders the tier heading inside a section anchored by its slug", () => {
    const { container } = render(<TierSection tier={horizons} />);
    expect(
      screen.getByRole("heading", { name: "RISE Horizons" }),
    ).toBeInTheDocument();
    expect(container.querySelector("#rise-horizons")).not.toBeNull();
  });

  it("renders the focus areas", () => {
    render(<TierSection tier={horizons} />);
    expect(screen.getByText("Leadership Development")).toBeInTheDocument();
  });

  it("renders mentor and mentee CTAs for Horizons", () => {
    render(<TierSection tier={horizons} />);
    expect(
      screen.getByRole("link", { name: /Apply to be a mentor/i }),
    ).toHaveAttribute("href", "/get-involved/mentor");
    expect(
      screen.getByRole("link", { name: /Apply to be a mentee/i }),
    ).toHaveAttribute("href", "/get-involved/mentee");
  });

  it("renders the Impact Network CTA pointing at the dead path", () => {
    render(<TierSection tier={network} />);
    expect(
      screen.getByRole("link", { name: /Join the community/i }),
    ).toHaveAttribute("href", "/get-involved/impact-network");
  });
});
