import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmissionTable } from "../SubmissionTable";
import type { SubmissionSummary } from "@/lib/types";

const contactSubmission: SubmissionSummary = {
  id: "0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  type: "contact",
  fullName: "Ada Obi",
  email: "ada@example.com",
  status: "pending",
  notes: "",
  from: "contact",
  reviewedBy: null,
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
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders the type cell", () => {
    render(<SubmissionTable submissions={[contactSubmission]} />);
    expect(screen.getByText("contact")).toBeInTheDocument();
  });

  it("resolves the reviewer id to a name via the map", () => {
    const claimed: SubmissionSummary = {
      ...contactSubmission,
      reviewedBy: "admin-1",
    };
    render(
      <SubmissionTable
        submissions={[claimed]}
        reviewerNames={{ "admin-1": "Bisi Ade" }}
      />,
    );
    expect(screen.getByText("Bisi Ade")).toBeInTheDocument();
  });
});
