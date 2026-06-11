import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GetInvolvedPage from "../page";
import { routes } from "@/lib/site";

vi.mock("@/lib/actions/submissions", () => ({
  submitVolunteer: vi.fn(),
}));

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

  it("embeds the volunteer interest form in the volunteer section", () => {
    const { container } = render(<GetInvolvedPage />);
    const volunteerSection = container.querySelector("#volunteer");
    expect(volunteerSection).not.toBeNull();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /area of interest/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register your interest/i }),
    ).toBeInTheDocument();
  });
});
