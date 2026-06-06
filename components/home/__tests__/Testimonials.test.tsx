import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "../Testimonials";

describe("Testimonials", () => {
  it("renders both participant attributions", () => {
    render(<Testimonials />);
    expect(screen.getByText("Timilehin Ayoola")).toBeInTheDocument();
    expect(screen.getByText("Paul Adedeji")).toBeInTheDocument();
  });

  it("renders the quotes inside blockquotes", () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelectorAll("blockquote")).toHaveLength(2);
  });
});
