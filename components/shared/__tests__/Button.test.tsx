import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders a <button> by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button", { name: "Click" }).tagName).toBe("BUTTON");
  });

  it("renders an internal link when href is set", () => {
    render(<Button href="/projects">Programmes</Button>);
    const link = screen.getByRole("link", { name: "Programmes" });
    expect(link).toHaveAttribute("href", "/projects");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links safely in a new tab", () => {
    render(
      <Button href="https://example.com" external>
        Out
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Out" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies variant + size classes", () => {
    render(
      <Button variant="white" size="lg">
        X
      </Button>,
    );
    expect(screen.getByRole("button", { name: "X" }).className).toContain(
      "bg-white",
    );
  });
});
