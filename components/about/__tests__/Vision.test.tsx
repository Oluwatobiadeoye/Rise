import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Vision } from "../Vision";

describe("Vision", () => {
  it("renders the vision and mission statements", () => {
    render(<Vision />);
    expect(
      screen.getByRole("heading", { name: /Vision and mission/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/success becomes a catalyst for collective progress/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /identify, develop, connect, and inspire individuals/i,
      ),
    ).toBeInTheDocument();
  });
});
