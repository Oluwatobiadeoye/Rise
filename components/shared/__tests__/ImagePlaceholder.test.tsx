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
});
