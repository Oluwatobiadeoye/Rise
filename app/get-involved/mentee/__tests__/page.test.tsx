import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MenteePage from "../page";

describe("Mentee application page", () => {
  it("renders the page heading", () => {
    render(<MenteePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /apply for mentorship/i }),
    ).toBeInTheDocument();
  });

  it("renders all mentee form fields with accessible labels", () => {
    render(<MenteePage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short essay/i)).toBeInTheDocument();
  });

  it("renders the submit control", () => {
    render(<MenteePage />);
    expect(
      screen.getByRole("button", { name: /apply for mentorship/i }),
    ).toBeInTheDocument();
  });
});
