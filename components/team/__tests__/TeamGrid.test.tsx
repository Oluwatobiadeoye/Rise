import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamGrid } from "../TeamGrid";

describe("TeamGrid", () => {
  it("renders a card for every member", () => {
    render(<TeamGrid />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  it("renders a bio for every member, with no coming-soon cards", () => {
    render(<TeamGrid />);
    expect(screen.queryByText(/Full bio coming soon/i)).not.toBeInTheDocument();
  });
});
