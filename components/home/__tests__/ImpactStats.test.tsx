import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImpactStats } from "../ImpactStats";

describe("ImpactStats", () => {
  it("renders the three figures", () => {
    render(<ImpactStats />);
    expect(screen.getByText("10,000")).toBeInTheDocument();
    expect(screen.getByText("3 tiers")).toBeInTheDocument();
    expect(screen.getByText("Since 2017")).toBeInTheDocument();
  });

  it("frames 10,000 honestly as a five-year goal", () => {
    render(<ImpactStats />);
    expect(screen.getByText(/five-year goal/i)).toBeInTheDocument();
  });
});
