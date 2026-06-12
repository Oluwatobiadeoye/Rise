import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MentorPage from "../page";
import { db } from "@/lib/db";
import type { Cycle } from "@/lib/types";

vi.mock("@/lib/db", () => ({
  db: { getActiveCycle: vi.fn() },
}));

vi.mock("@/lib/actions/submissions", () => ({
  submitMentor: vi.fn(),
  submitNotifyMe: vi.fn(),
}));

const getActiveCycleMock = vi.mocked(db.getActiveCycle);

const mentorCycle: Cycle = {
  id: "cycle-1",
  role: "mentor",
  label: "Summer 2026",
  openAt: "2026-06-01T00:00:00.000Z",
  closeAt: "2026-07-01T00:00:00.000Z",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

async function renderPage(searchParams: Record<string, string> = {}) {
  return render(await MentorPage({ searchParams: Promise.resolve(searchParams) }));
}

beforeEach(() => {
  getActiveCycleMock.mockResolvedValue(mentorCycle);
});

describe("Mentor application page", () => {
  it("renders the page heading", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: /apply to mentor/i }),
    ).toBeInTheDocument();
  });

  it("renders all mentor form fields when the cycle is open", async () => {
    await renderPage();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/field of expertise/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /who would you like to mentor/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /how often can you meet/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/short message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /apply to mentor/i }),
    ).toBeInTheDocument();
  });

  it("passes a valid from search param into the form", async () => {
    const { container } = await renderPage({ from: "home" });
    expect(container.querySelector('input[name="from"]')).toHaveAttribute(
      "value",
      "home",
    );
  });

  it("drops an unsafe from search param", async () => {
    const { container } = await renderPage({ from: "bad slug!" });
    expect(container.querySelector('input[name="from"]')).toBeNull();
  });

  it("shows the closed notice and notify-me form when the cycle is closed", async () => {
    getActiveCycleMock.mockResolvedValue(null);
    await renderPage();
    expect(
      screen.getByText(/mentor applications are currently closed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /notify me/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply to mentor/i }),
    ).not.toBeInTheDocument();
  });
});
