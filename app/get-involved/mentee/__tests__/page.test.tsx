import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MenteePage from "../page";
import { db } from "@/lib/db";
import type { Cycles } from "@/lib/types";

vi.mock("@/lib/db", () => ({
  db: { getCycles: vi.fn() },
}));

vi.mock("@/lib/actions/submissions", () => ({
  submitMentee: vi.fn(),
  submitNotifyMe: vi.fn(),
}));

const getCyclesMock = vi.mocked(db.getCycles);

function cycles(open: boolean): Cycles {
  return {
    mentor: { open: false, updatedAt: null },
    mentee: { open, updatedAt: null },
  };
}

async function renderPage(searchParams: Record<string, string> = {}) {
  return render(await MenteePage({ searchParams: Promise.resolve(searchParams) }));
}

beforeEach(() => {
  getCyclesMock.mockResolvedValue(cycles(true));
});

describe("Mentee application page", () => {
  it("renders the page heading", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: /apply for mentorship/i }),
    ).toBeInTheDocument();
  });

  it("renders all mentee form fields when the cycle is open", async () => {
    await renderPage();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toHaveAttribute(
      "type",
      "date",
    );
    expect(screen.getByLabelText(/short essay/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /apply for mentorship/i }),
    ).toBeInTheDocument();
  });

  it("shows the closed notice and notify-me form when the cycle is closed", async () => {
    getCyclesMock.mockResolvedValue(cycles(false));
    await renderPage();
    expect(
      screen.getByText(/mentee applications are currently closed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /notify me/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply for mentorship/i }),
    ).not.toBeInTheDocument();
  });
});
