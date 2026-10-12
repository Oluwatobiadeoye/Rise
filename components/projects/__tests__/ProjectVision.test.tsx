import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectVision } from "../ProjectVision";

describe("ProjectVision", () => {
  it("presents the future vision as a labelled section", () => {
    render(
      <ProjectVision
        eyebrow="The future we see"
        title="Rooted here. Growing towards tomorrow."
        body="A thriving city of opportunity."
      />,
    );

    expect(screen.getByText("The future we see")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Rooted here. Growing towards tomorrow.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("A thriving city of opportunity.")).toBeInTheDocument();
  });
});
