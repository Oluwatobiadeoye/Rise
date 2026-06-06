import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Logo } from "../Logo";

describe("Logo", () => {
  it("renders the three ascending chevrons", () => {
    const { container } = render(<Logo />);
    expect(container.querySelectorAll("path")).toHaveLength(3);
  });

  it("is decorative (aria-hidden)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses brand colours in colour tone and currentColor in mono", () => {
    const { container: colour } = render(<Logo tone="color" />);
    expect(colour.querySelector("path")).toHaveAttribute(
      "stroke",
      "var(--rise-evergreen)",
    );

    const { container: mono } = render(<Logo tone="mono" />);
    expect(mono.querySelector("path")).toHaveAttribute("stroke", "currentColor");
  });
});
