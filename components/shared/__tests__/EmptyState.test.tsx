import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the title and body", () => {
    render(<EmptyState title="Nothing here yet." body="Come back soon." />);
    expect(
      screen.getByRole("heading", { name: "Nothing here yet." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Come back soon.")).toBeInTheDocument();
  });

  it("renders the call to action link when provided", () => {
    render(
      <EmptyState
        title="Nothing here yet."
        body="Come back soon."
        cta={{ label: "Go home", href: "/" }}
      />,
    );
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("omits the call to action when not provided", () => {
    render(<EmptyState title="Nothing here yet." body="Come back soon." />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the icon decoratively", () => {
    const { container } = render(
      <EmptyState
        icon={<svg data-testid="icon" />}
        title="Nothing here yet."
        body="Come back soon."
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
