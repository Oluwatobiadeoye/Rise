import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactDetails } from "../ContactDetails";
import { contactEmail, socials } from "@/lib/site";

describe("ContactDetails", () => {
  it("renders the section heading", () => {
    render(<ContactDetails />);
    expect(
      screen.getByRole("heading", { name: /contact details/i }),
    ).toBeInTheDocument();
  });

  it("renders the single contact inbox as a mailto link", () => {
    render(<ContactDetails />);
    expect(screen.getByRole("link", { name: contactEmail })).toHaveAttribute(
      "href",
      "mailto:hello@risedevinitiative.org",
    );
  });

  it("renders a social link for each configured channel", () => {
    render(<ContactDetails />);
    for (const social of socials) {
      const link = screen.getByRole("link", { name: social.label });
      expect(link).toHaveAttribute("href", social.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
