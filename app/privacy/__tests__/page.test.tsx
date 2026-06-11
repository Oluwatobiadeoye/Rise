import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "../page";
import { metadata } from "../page";

describe("PrivacyPage", () => {
  it("renders the page heading", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /privacy policy/i }),
    ).toBeInTheDocument();
  });

  it("discloses what each form collects, including the notify-me list", () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/contact form/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mentor application/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/mentee application/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/volunteer interest form/i)).toBeInTheDocument();
    expect(screen.getByText(/notify me list/i)).toBeInTheDocument();
    expect(screen.getAllByText(/date of birth/i).length).toBeGreaterThan(0);
  });

  it("states the lawful basis under the Nigeria Data Protection Act 2023", () => {
    render(<PrivacyPage />);
    expect(
      screen.getAllByText(/nigeria data protection act 2023/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: /lawful basis/i }),
    ).toBeInTheDocument();
  });

  it("discloses how a minor applicant's data is handled with offline guardian sign-off", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: /applicants under 18/i }),
    ).toBeInTheDocument();
    const minorParagraph = screen.getByText(
      /parent or guardian before any\s+mentor matching/i,
    );
    expect(minorParagraph).toBeInTheDocument();
    expect(minorParagraph).toHaveTextContent(/offline/i);
  });

  it("explains data retention and a deletion / contact route", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: /how long we keep/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact page/i }),
    ).toHaveAttribute("href", "/contact");
  });

  it("states the site uses cookieless analytics and sets no tracking cookies", () => {
    render(<PrivacyPage />);
    const analytics = screen.getByText(/cookieless analytics/i);
    expect(analytics).toBeInTheDocument();
    expect(analytics).toHaveTextContent(/do not set tracking cookies/i);
  });

  it("exposes per-page metadata via the pageMetadata helper", () => {
    expect(metadata.title).toBe("Privacy policy");
    expect(metadata.alternates?.canonical).toBe("/privacy");
  });
});
