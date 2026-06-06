import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";
import { socials } from "@/lib/site";

describe("Footer", () => {
  it("renders social links with safe rel and accessible labels", () => {
    render(<Footer />);
    for (const s of socials) {
      const link = screen.getByRole("link", { name: s.label });
      expect(link).toHaveAttribute("href", s.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("shows the current year in the copyright", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${year} RISE Initiative`)),
    ).toBeInTheDocument();
  });
});
