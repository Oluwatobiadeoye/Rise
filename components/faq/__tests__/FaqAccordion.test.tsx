import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqAccordion } from "../FaqAccordion";
import { routes, contactEmails } from "@/lib/site";

describe("FaqAccordion", () => {
  it("renders the four verbatim questions", () => {
    render(<FaqAccordion />);
    for (const question of [
      "Who is eligible for the mentorship programme?",
      "How do I join the Oyo professional community?",
      "How can my school partner with RISE Initiative?",
      "Is RISE Initiative a registered non-governmental organisation (NGO)?",
    ]) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it("renders a grounded answer snippet for each question", () => {
    render(<FaqAccordion />);
    expect(
      screen.getByText(/tertiary institutions affiliated with Oyo town/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/RISE Impact Network/i)).toBeInTheDocument();
    expect(screen.getByText(/RISE Foundations/i)).toBeInTheDocument();
    expect(
      screen.getByText(/in the process of registering/i),
    ).toBeInTheDocument();
  });

  it("renders exactly four collapsible details elements", () => {
    const { container } = render(<FaqAccordion />);
    expect(container.querySelectorAll("details")).toHaveLength(4);
  });

  it("links the mentee application and the partnerships email from site config", () => {
    render(<FaqAccordion />);
    expect(
      screen.getByRole("link", { name: /apply to be a mentee/i }),
    ).toHaveAttribute("href", routes.mentee);
    expect(
      screen.getByRole("link", { name: /partnerships team/i }),
    ).toHaveAttribute("href", `mailto:${contactEmails.partnerships}`);
  });
});
