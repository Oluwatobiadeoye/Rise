import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotifyMeForm } from "../NotifyMeForm";
import { submitNotifyMe } from "@/lib/actions/submissions";
import type { FormState } from "@/lib/types";

vi.mock("@/lib/actions/submissions", () => ({
  submitNotifyMe: vi.fn(),
}));

const submitNotifyMeMock = vi.mocked(submitNotifyMe);

beforeEach(() => {
  submitNotifyMeMock.mockResolvedValue({ status: "success" });
});

function submitForm(container: HTMLElement) {
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

describe("NotifyMeForm", () => {
  it("renders an email field and a hidden role input", () => {
    const { container } = render(<NotifyMeForm role="mentor" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    const roleInput = container.querySelector('input[name="role"]');
    expect(roleInput).toHaveAttribute("type", "hidden");
    expect(roleInput).toHaveAttribute("value", "mentor");
  });

  it("includes a hidden honeypot field", () => {
    const { container } = render(<NotifyMeForm role="mentee" />);
    const honeypot = container.querySelector('input[name="company"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("shows a confirmation after a successful signup", async () => {
    const { container } = render(<NotifyMeForm role="mentor" />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "ada@example.com" },
    });
    submitForm(container);

    const confirmation = await screen.findByRole("status");
    expect(confirmation).toHaveTextContent(/email you when the next cycle/i);
  });

  it("shows the email error returned by the action", async () => {
    submitNotifyMeMock.mockResolvedValue({
      status: "error",
      errors: { email: "Please enter a valid email address." },
    } satisfies FormState);
    const { container } = render(<NotifyMeForm role="mentor" />);
    submitForm(container);

    expect(
      await screen.findByText(/valid email address/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
