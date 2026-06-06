import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Objectives } from "../Objectives";

describe("Objectives", () => {
  it("renders all five objective titles", () => {
    render(<Objectives />);
    for (const title of [
      "Leadership Development",
      "Mentorship and Opportunity Access",
      "Education and Talent Development",
      "Community Engagement and Service",
      "Sustainable Community Transformation",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("folds in the cultural heritage and UN Sustainable Development Goals", () => {
    render(<Objectives />);
    expect(screen.getByText(/cultural heritage/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Goals 4 \(Quality Education\)/i),
    ).toBeInTheDocument();
  });
});
