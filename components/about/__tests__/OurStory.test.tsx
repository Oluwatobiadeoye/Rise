import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OurStory } from "../OurStory";

describe("OurStory", () => {
  it("renders the heading and the founding story", () => {
    render(<OurStory />);
    expect(
      screen.getByRole("heading", { name: /Built on belief in young people/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/talent is everywhere, but opportunity is not/i)).toBeInTheDocument();
    expect(screen.getByText(/Our journey began in 2017/i)).toBeInTheDocument();
  });
});
