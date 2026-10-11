import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "../Testimonials";
import { excerptOf, featuredTestimonials } from "@/lib/testimonials";

describe("Testimonials", () => {
  it("renders the three featured participants in order", () => {
    render(<Testimonials />);
    expect(featuredTestimonials.map((t) => t.name)).toEqual([
      "Adetoro Moses",
      "Maryam Thabit",
      "Hawau A. Ojerinde",
    ]);
    for (const t of featuredTestimonials) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    }
  });

  it("shows each headline and excerpt inside a blockquote", () => {
    const { container } = render(<Testimonials />);
    const quotes = container.querySelectorAll("blockquote");
    expect(quotes).toHaveLength(3);
    featuredTestimonials.forEach((t, i) => {
      expect(quotes[i]).toHaveTextContent(t.headline);
      expect(quotes[i]).toHaveTextContent(excerptOf(t));
    });
  });

  it("shows a portrait for each featured participant", () => {
    render(<Testimonials />);
    expect(
      screen.getByRole("img", { name: "Portrait of Adetoro Moses", hidden: true }),
    ).toBeInTheDocument();
  });

  it("links each card to that person's full story", () => {
    render(<Testimonials />);
    const links = screen.getAllByRole("link", { name: /Read full story/i, hidden: true });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      featuredTestimonials.map((t) => `/testimonials#${t.slug}`),
    );
  });

  it("keeps off-screen slides out of the tab order", () => {
    const { container } = render(<Testimonials />);
    const slides = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides[0]).not.toHaveAttribute("inert");
    expect(slides[1]).toHaveAttribute("inert");
    expect(slides[2]).toHaveAttribute("inert");
  });

  it("links to the full testimonials page", () => {
    render(<Testimonials />);
    expect(
      screen.getByRole("link", { name: /More voices of RISE/i }),
    ).toHaveAttribute("href", "/testimonials");
  });
});
