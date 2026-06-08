import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "../ContactForm";

describe("ContactForm", () => {
  it("renders the section heading", () => {
    render(<ContactForm />);
    expect(
      screen.getByRole("heading", { name: /write to us/i }),
    ).toBeInTheDocument();
  });

  it("renders text fields with accessible labels", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("associates the role select with its label", () => {
    render(<ContactForm />);
    const select = screen.getByRole("combobox", { name: /i am a/i });
    expect(select).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /organisation/i }),
    ).toBeInTheDocument();
  });

  it("renders a submit control", () => {
    render(<ContactForm />);
    expect(
      screen.getByRole("button", { name: /send|submit/i }),
    ).toBeInTheDocument();
  });

  it("does not navigate on submit (submission is deferred)", () => {
    render(<ContactForm />);
    const form = screen
      .getByRole("button", { name: /send|submit/i })
      .closest("form");
    expect(form).not.toBeNull();
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(form as HTMLFormElement, submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it("shows an accessible confirmation after submit", () => {
    render(<ContactForm />);
    const form = screen
      .getByRole("button", { name: /send|submit/i })
      .closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    const confirmation = screen.getByRole("status");
    expect(confirmation).toHaveTextContent(/we will be in touch/i);
    // The form is replaced by the confirmation, so the submit control is gone.
    expect(
      screen.queryByRole("button", { name: /send|submit/i }),
    ).not.toBeInTheDocument();
  });
});
