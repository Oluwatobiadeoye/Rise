import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImagePlaceholder } from "../ImagePlaceholder";

describe("ImagePlaceholder", () => {
  it("exposes an accessible image role carrying the label", () => {
    render(<ImagePlaceholder label="Young leaders at a workshop" />);
    expect(
      screen.getByRole("img", { name: /Young leaders at a workshop/i }),
    ).toBeInTheDocument();
  });

  it("defaults to a rounded rectangle and accepts a shape override", () => {
    const { rerender } = render(<ImagePlaceholder label="Default" />);
    expect(screen.getByRole("img", { name: /Default/i })).toHaveClass(
      "rounded-lg",
    );

    rerender(<ImagePlaceholder label="Circle" rounded="rounded-full" />);
    const circle = screen.getByRole("img", { name: /Circle/i });
    expect(circle).toHaveClass("rounded-full");
    expect(circle).not.toHaveClass("rounded-lg");
  });
});
