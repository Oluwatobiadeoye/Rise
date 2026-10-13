import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsIntro } from "../ProjectsIntro";

describe("ProjectsIntro", () => {
  it("introduces and links to the projects", () => {
    render(<ProjectsIntro />);

    expect(
      screen.getByRole("heading", { name: /turning purpose into programmes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explore all projects/i }),
    ).toHaveAttribute("href", "/projects");
    expect(
      screen.getByRole("link", { name: /the oyo project/i }),
    ).toHaveAttribute("href", "/projects/the-oyo-project");
    expect(
      screen.getByRole("link", { name: /foundations of impact/i }),
    ).toHaveAttribute("href", "/projects/foundations-of-impact");
  });
});
