import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Nav } from "../Nav";
import { navLinks } from "@/lib/site";

describe("Nav", () => {
  it("renders the brand and every primary link", () => {
    render(<Nav />);
    expect(screen.getAllByRole("link", { name: /RISE/i }).length).toBeGreaterThan(
      0,
    );
    for (const l of navLinks) {
      expect(
        screen.getAllByRole("link", { name: l.label }).length,
      ).toBeGreaterThan(0);
    }
  });

  it("toggles the mobile menu open and closed", () => {
    render(<Nav />);
    const openBtn = screen.getByRole("button", { name: /open menu/i });
    expect(openBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(openBtn);
    expect(
      screen.getByRole("button", { name: /close menu/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("marks the current route with aria-current", () => {
    render(<Nav />);
    const home = screen.getAllByRole("link", { name: "Home" })[0];
    expect(home).toHaveAttribute("aria-current", "page");
  });
});
