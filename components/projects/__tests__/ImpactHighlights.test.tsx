import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImpactHighlights } from "../ImpactHighlights";
import { getProject } from "@/lib/projects";

const highlights = getProject("foundations-of-impact")!.highlights!;

describe("ImpactHighlights", () => {
  it("renders the 600+ students highlight", () => {
    render(<ImpactHighlights highlights={highlights} />);
    expect(screen.getByText(/more than 600 students/i)).toBeInTheDocument();
  });

  it("renders an item per highlight", () => {
    render(<ImpactHighlights highlights={highlights} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(highlights.length);
  });
});
