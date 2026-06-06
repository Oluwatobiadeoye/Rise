import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Vision } from "../Vision";

describe("Vision", () => {
  it("renders the heading and both vision statements", () => {
    render(<Vision />);
    expect(
      screen.getByRole("heading", { name: /Where we are headed/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/thriving, empowered, and connected community/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/success becomes a catalyst for collective progress/i),
    ).toBeInTheDocument();
  });
});
