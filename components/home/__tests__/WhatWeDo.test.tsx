import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatWeDo } from "../WhatWeDo";

describe("WhatWeDo", () => {
  it("renders the three programme tiers", () => {
    render(<WhatWeDo />);
    expect(
      screen.getByRole("heading", { name: "Secondary schools" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tertiary students" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Early-career professionals" }),
    ).toBeInTheDocument();
  });

  it("expands acronyms on first use", () => {
    render(<WhatWeDo />);
    expect(
      screen.getByText(/West African Examinations Council \(WAEC\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Joint Admissions and Matriculation Board \(JAMB\)/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Vitae \(CV\)/)).toBeInTheDocument();
  });

  it("deep-links each card to its programme tier on the TOP page", () => {
    render(<WhatWeDo />);
    const links = screen.getAllByRole("link", { name: /Find out more/i });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/projects/the-oyo-project#rise-foundations",
      "/projects/the-oyo-project#rise-horizons",
      "/projects/the-oyo-project#rise-impact-network",
    ]);
  });
});
