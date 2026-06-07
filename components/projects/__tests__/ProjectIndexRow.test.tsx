import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectIndexRow } from "../ProjectIndexRow";
import { getProject } from "@/lib/projects";

const top = getProject("the-oyo-project")!;

describe("ProjectIndexRow", () => {
  it("renders the project name and links 'Read more' to its detail page", () => {
    render(<ProjectIndexRow project={top} />);
    const readMore = screen.getByRole("link", { name: /Read more/i });
    expect(readMore).toHaveAttribute("href", "/projects/the-oyo-project");
  });

  it("shows the status and period", () => {
    render(<ProjectIndexRow project={top} />);
    expect(screen.getByText(/Active · 2026/)).toBeInTheDocument();
  });
});
