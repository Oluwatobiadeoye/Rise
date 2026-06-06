import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "../Container";

describe("Container", () => {
  it("renders children and constrains the width", () => {
    render(<Container>content</Container>);
    expect(screen.getByText("content").className).toContain("max-w-[1140px]");
  });

  it("supports a custom element via `as`", () => {
    render(<Container as="section">section content</Container>);
    expect(screen.getByText("section content").tagName).toBe("SECTION");
  });
});
