import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamGrid } from "../TeamGrid";

describe("TeamGrid", () => {
  it("renders a card for every member", () => {
    render(<TeamGrid />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  it("shows no coming-soon cards when all members have bios", () => {
    render(<TeamGrid />);
    expect(screen.queryAllByText(/Full bio coming soon/i)).toHaveLength(0);
  });
});
