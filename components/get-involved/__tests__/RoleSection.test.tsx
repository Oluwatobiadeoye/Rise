import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleSection } from "../RoleSection";

describe("RoleSection", () => {
  it("renders the heading, body, and CTA link", () => {
    render(
      <RoleSection
        eyebrow="Become a mentor"
        title="Mentor a student"
        body={["First paragraph.", "Second paragraph."]}
        cta={{ label: "Apply to mentor", href: "/get-involved/mentor" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Mentor a student" }),
    ).toBeInTheDocument();
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Apply to mentor" }),
    ).toHaveAttribute("href", "/get-involved/mentor");
  });

  it("anchors the section and applies scroll clearance only when an id is passed", () => {
    const { container } = render(
      <RoleSection
        id="volunteer"
        eyebrow="Volunteer roles"
        title="Volunteer with us"
        body={["Body."]}
        cta={{ label: "Register your interest", href: "/contact" }}
      />,
    );

    const anchored = container.querySelector("#volunteer");
    expect(anchored).not.toBeNull();
    expect(anchored?.className).toContain("scroll-mt-24");
  });

  it("does not anchor or add scroll clearance when no id is passed", () => {
    const { container } = render(
      <RoleSection
        eyebrow="Become a mentor"
        title="Mentor a student"
        body={["Body."]}
        cta={{ label: "Apply to mentor", href: "/get-involved/mentor" }}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.getAttribute("id")).toBeNull();
    expect(section?.className).not.toContain("scroll-mt-24");
  });

  it("renders a disabled placeholder with helper text and a fallback link", () => {
    render(
      <RoleSection
        id="support-a-student"
        eyebrow="Support a student"
        title="Sponsor exam fees"
        body={["Body."]}
        disabledCta
        disabledLabel="Donate"
        ctaNote="Online donations are coming soon."
        ctaHref="mailto:hello@rise.org"
        fallbackLabel="Email us to give"
      />,
    );

    expect(screen.getByRole("button", { name: "Donate" })).toBeDisabled();
    expect(
      screen.getByText("Online donations are coming soon."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Email us to give" }),
    ).toHaveAttribute("href", "mailto:hello@rise.org");
  });
});
