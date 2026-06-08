import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OurStory } from "../OurStory";

describe("OurStory", () => {
  it("renders the heading and the founding story", () => {
    render(<OurStory />);
    expect(
      screen.getAllByRole("heading", { name: /Built on belief in young people/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/talent is everywhere, but opportunity is not/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Our journey began in 2017/i).length).toBeGreaterThan(0);
  });
});
