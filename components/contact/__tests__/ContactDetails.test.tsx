import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactDetails } from "../ContactDetails";
import { contactEmails, socials } from "@/lib/site";

describe("ContactDetails", () => {
  it("renders the section heading", () => {
    render(<ContactDetails />);
    expect(
      screen.getByRole("heading", { name: /contact details/i }),
    ).toBeInTheDocument();
  });

  it("renders each contact method as a mailto link from lib/site", () => {
    render(<ContactDetails />);
    expect(
      screen.getByRole("link", { name: contactEmails.general }),
    ).toHaveAttribute("href", `mailto:${contactEmails.general}`);
    expect(
      screen.getByRole("link", { name: contactEmails.partnerships }),
    ).toHaveAttribute("href", `mailto:${contactEmails.partnerships}`);
    expect(
      screen.getByRole("link", { name: contactEmails.mentorship }),
    ).toHaveAttribute("href", `mailto:${contactEmails.mentorship}`);
    expect(
      screen.getByRole("link", { name: contactEmails.media }),
    ).toHaveAttribute("href", `mailto:${contactEmails.media}`);
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
