import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Eyebrow } from "../Eyebrow";

describe("Eyebrow", () => {
  it("renders its text", () => {
    render(<Eyebrow>What we do</Eyebrow>);
    expect(screen.getByText("What we do")).toBeInTheDocument();
  });

  it("uses the gold tone on dark bands", () => {
    render(<Eyebrow tone="gold">Our impact</Eyebrow>);
    expect(screen.getByText("Our impact").className).toContain("text-gold");
  });

  it("defaults to the primary tone", () => {
    render(<Eyebrow>Voices</Eyebrow>);
    expect(screen.getByText("Voices").className).toContain("text-primary");
  });
});
