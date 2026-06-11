import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// The card wires a native form to the toggleCycle server action; that module
// pulls in server-only code, so stub it for the render test.
vi.mock("@/lib/actions/admin", () => ({
  toggleCycle: vi.fn(),
}));

import { CycleCard } from "../CycleCard";

describe("CycleCard", () => {
  it("shows an Open badge and a Close button when the cycle is open", () => {
    render(
      <CycleCard
        role="mentor"
        state={{ open: true, updatedAt: null }}
      />,
    );
    expect(screen.getByText("Mentor applications")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close cycle" }),
    ).toBeInTheDocument();
  });

  it("shows a Closed badge and an Open button when the cycle is closed", () => {
    render(
      <CycleCard
        role="mentee"
        state={{ open: false, updatedAt: null }}
      />,
    );
    expect(screen.getByText("Mentee applications")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open cycle" }),
    ).toBeInTheDocument();
  });

  it("posts the inverse open state in the hidden field", () => {
    const { container } = render(
      <CycleCard role="mentor" state={{ open: true, updatedAt: null }} />,
    );
    const openField = container.querySelector(
      'input[name="open"]',
    ) as HTMLInputElement | null;
    const roleField = container.querySelector(
      'input[name="role"]',
    ) as HTMLInputElement | null;
    expect(openField?.value).toBe("false");
    expect(roleField?.value).toBe("mentor");
  });
});
