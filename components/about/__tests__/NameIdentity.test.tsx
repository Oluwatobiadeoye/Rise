import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NameIdentity } from "../NameIdentity";

describe("NameIdentity", () => {
  it("explains the Agboolé meaning and the Oyo Project name", () => {
    render(<NameIdentity />);
    expect(screen.getByText(/Agboolé/)).toBeInTheDocument();
    expect(screen.getByText(/The Oyo Project \(TOP\)/)).toBeInTheDocument();
    expect(screen.getByText(/the compound, the family home/i)).toBeInTheDocument();
  });

  it("includes a short explainer of what Oyo town is", () => {
    render(<NameIdentity />);
    expect(
      screen.getByText(/historic community in southwestern Nigeria/i),
    ).toBeInTheDocument();
  });

  it("pairs the story with a sourced image of Oyo town", () => {
    render(<NameIdentity />);
    expect(
      screen.getByRole("img", { name: /lively street in Oyo town/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Oyo State Feedback Service/i }),
    ).toHaveAttribute(
      "href",
      "https://feedbackoysg.com/ongoing-project-light-up-oyo-installation-of-streetlights-in-oyo-town/",
    );
  });
});
