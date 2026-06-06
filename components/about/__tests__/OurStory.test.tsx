import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OurStory } from "../OurStory";

describe("OurStory", () => {
  it("renders the heading and the founding dates", () => {
    render(<OurStory />);
    expect(
      screen.getByRole("heading", { name: /Built on belief in young people/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/In 2017, RISE Initiative was founded/i)).toBeInTheDocument();
    expect(screen.getByText(/In 2019, we delivered leadership/i)).toBeInTheDocument();
  });

  it("expands the SDG acronym on first use", () => {
    render(<OurStory />);
    expect(
      screen.getByText(/Sustainable Development Goals\s*\(SDG\)/i),
    ).toBeInTheDocument();
  });
});
