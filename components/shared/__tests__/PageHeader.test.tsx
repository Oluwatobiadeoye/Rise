import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders the eyebrow, title as an h1, and the lede", () => {
    render(
      <PageHeader eyebrow="Our team" title="The people behind RISE." lede="A diverse team." />,
    );
    expect(screen.getByText("Our team")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "The people behind RISE." }),
    ).toBeInTheDocument();
    expect(screen.getByText("A diverse team.")).toBeInTheDocument();
  });

  it("omits the lede when none is given", () => {
    render(<PageHeader eyebrow="About" title="About us." />);
    expect(
      screen.getByRole("heading", { level: 1, name: "About us." }),
    ).toBeInTheDocument();
  });
});
