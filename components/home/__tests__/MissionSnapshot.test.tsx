import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissionSnapshot } from "../MissionSnapshot";

describe("MissionSnapshot", () => {
  it("renders the mission statement", () => {
    render(<MissionSnapshot />);
    expect(
      screen.getByText(/identify, develop, connect, and inspire/i),
    ).toBeInTheDocument();
  });

  it("links to Our Story", () => {
    render(<MissionSnapshot />);
    expect(screen.getByRole("link", { name: /Our story/i })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
