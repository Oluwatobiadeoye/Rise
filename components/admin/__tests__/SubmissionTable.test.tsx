import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmissionTable } from "../SubmissionTable";
import type { Submission } from "@/lib/types";

const contactSubmission: Submission<"contact"> = {
  id: "0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  type: "contact",
  payload: {
    fullName: "Ada Obi",
    email: "ada@example.com",
    role: "Student",
    message: "Hello RISE.",
  },
  status: "new",
  notes: "",
  from: "contact",
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

describe("SubmissionTable", () => {
  it("renders an empty state when there are no submissions", () => {
    render(<SubmissionTable submissions={[]} />);
    expect(
      screen.getByText("No submissions match these filters yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a row linking to the submission detail", () => {
    render(<SubmissionTable submissions={[contactSubmission]} />);
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Ada Obi" });
    expect(link).toHaveAttribute(
      "href",
      "/admin/submissions/contact/0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
    );
  });

  it("shows the status badge", () => {
    render(<SubmissionTable submissions={[contactSubmission]} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders the type and referrer cells", () => {
    render(<SubmissionTable submissions={[contactSubmission]} />);
    // The type cell and the from cell both read "contact".
    expect(screen.getAllByText("contact")).toHaveLength(2);
  });
});
