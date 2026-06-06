import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterCtaBand } from "../FooterCtaBand";

describe("FooterCtaBand", () => {
  it("routes each CTA to its specific destination", () => {
    render(<FooterCtaBand />);
    expect(
      screen.getByRole("link", { name: /Apply as a mentee/i }),
    ).toHaveAttribute("href", "/get-involved/mentee");
    expect(
      screen.getByRole("link", { name: /Become a mentor/i }),
    ).toHaveAttribute("href", "/get-involved/mentor");
    expect(
      screen.getByRole("link", { name: /Support a student/i }),
    ).toHaveAttribute("href", "/get-involved#support-a-student");
  });
});
