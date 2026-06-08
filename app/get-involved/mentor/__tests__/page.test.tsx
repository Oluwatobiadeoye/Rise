import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MentorPage from "../page";

describe("Mentor application page", () => {
  it("renders the page heading", () => {
    render(<MentorPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /apply to mentor/i }),
    ).toBeInTheDocument();
  });

  it("renders all mentor form fields with accessible labels", () => {
    render(<MentorPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/field of expertise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short message/i)).toBeInTheDocument();
  });

  it("renders the submit control", () => {
    render(<MentorPage />);
    expect(
      screen.getByRole("button", { name: /apply to mentor/i }),
    ).toBeInTheDocument();
  });
});
