import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamGrid } from "../TeamGrid";

describe("TeamGrid", () => {
  it("renders a card for every member", () => {
    render(<TeamGrid />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  it("shows coming-soon cards for the two members without bios", () => {
    render(<TeamGrid />);
    expect(screen.getAllByText(/Full bio coming soon/i)).toHaveLength(2);
  });
});
