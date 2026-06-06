import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Values } from "../Values";

describe("Values", () => {
  it("renders all six values", () => {
    render(<Values />);
    for (const title of [
      "Resilience",
      "Integrity",
      "Service",
      "Excellence",
      "Collaboration",
      "Impact",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("leads with the four R-I-S-E values in order", () => {
    render(<Values />);
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual([
      "Resilience",
      "Integrity",
      "Service",
      "Excellence",
      "Collaboration",
      "Impact",
    ]);
  });

  it("does not claim the name stands for the values", () => {
    render(<Values />);
    expect(screen.queryByText(/stands for/i)).not.toBeInTheDocument();
  });
});
