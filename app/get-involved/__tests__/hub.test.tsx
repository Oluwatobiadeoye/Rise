import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GetInvolvedPage from "../page";
import { routes } from "@/lib/site";

describe("Get involved hub", () => {
  it("renders the intro lede", () => {
    render(<GetInvolvedPage />);
    expect(
      screen.getByText(/runs on the energy, talent, and generosity/i),
    ).toBeInTheDocument();
  });

  it("renders the four role section headings", () => {
    render(<GetInvolvedPage />);
    expect(
      screen.getByRole("heading", { name: /mentor a student/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /join our mentorship programme/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /lend your skills as a volunteer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /sponsor a student's exam fees/i }),
    ).toBeInTheDocument();
  });

  it("anchors the volunteer and support-a-student sections", () => {
    const { container } = render(<GetInvolvedPage />);
    expect(container.querySelector("#volunteer")).not.toBeNull();
    expect(container.querySelector("#support-a-student")).not.toBeNull();
  });

  it("points the mentor and mentee CTAs at their application pages", () => {
    render(<GetInvolvedPage />);
    expect(
      screen.getByRole("link", { name: /apply to mentor/i }),
    ).toHaveAttribute("href", routes.mentor);
    expect(
      screen.getByRole("link", { name: /apply for mentorship/i }),
    ).toHaveAttribute("href", routes.mentee);
  });

  it("points the volunteer CTA at the contact route", () => {
    render(<GetInvolvedPage />);
    expect(
      screen.getByRole("link", { name: /register your interest/i }),
    ).toHaveAttribute("href", routes.contact);
  });
});
