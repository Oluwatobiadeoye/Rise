import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../Hero";

describe("Hero", () => {
  it("renders the broad headline with no Oyo framing", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Empowering the next generation of\s+leaders/i);
    expect(h1).not.toHaveTextContent(/Oyo/i);
  });

  it("uses learn-first CTAs to the right routes", () => {
    render(<Hero />);
    expect(
      screen.getByRole("link", { name: /Explore our programmes/i }),
    ).toHaveAttribute("href", "/projects");
    expect(
      screen.getByRole("link", { name: /Get involved/i }),
    ).toHaveAttribute("href", "/get-involved");
  });

  it("shows the hero image with descriptive alt text", () => {
    render(<Hero />);
    expect(
      screen.getByRole("img", { name: /young people/i }),
    ).toBeInTheDocument();
  });
});
