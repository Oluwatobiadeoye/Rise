import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestimonialCard } from "../TestimonialCard";
import { testimonials } from "@/lib/testimonials";

describe("TestimonialCard", () => {
  const maryam = testimonials.find((t) => t.slug === "maryam-thabit")!;

  it("renders the headline and every paragraph", () => {
    const { container } = render(<TestimonialCard testimonial={maryam} />);
    const quote = container.querySelector("blockquote")!;
    expect(quote).toHaveTextContent(maryam.headline);
    for (const paragraph of maryam.paragraphs) {
      expect(quote).toHaveTextContent(paragraph);
    }
  });

  it("attributes the quote with name, roles, school, and portrait", () => {
    render(<TestimonialCard testimonial={maryam} />);
    expect(screen.getByText("Maryam Thabit")).toBeInTheDocument();
    expect(screen.getByText(maryam.roles[0])).toBeInTheDocument();
    expect(screen.getByText(maryam.school)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Portrait of Maryam Thabit" }),
    ).toBeInTheDocument();
  });

  it("is anchored by slug so individual testimonials can be linked", () => {
    const { container } = render(<TestimonialCard testimonial={maryam} />);
    expect(container.querySelector("li")).toHaveAttribute("id", "maryam-thabit");
  });
});
