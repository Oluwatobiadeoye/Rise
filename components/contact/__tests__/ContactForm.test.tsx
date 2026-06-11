import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "../ContactForm";
import { submitContact } from "@/lib/actions/submissions";
import type { FormState } from "@/lib/types";

vi.mock("@/lib/actions/submissions", () => ({
  submitContact: vi.fn(),
}));

const submitContactMock = vi.mocked(submitContact);

beforeEach(() => {
  submitContactMock.mockResolvedValue({ status: "success" });
});

function submitForm(container: HTMLElement) {
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

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

  it("renders a required consent checkbox linking to the privacy policy", () => {
    render(<ContactForm />);
    const checkbox = screen.getByRole("checkbox", {
      name: /i agree to rise initiative storing my information/i,
    });
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("name", "consent");
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("shows a consent error wired through aria-describedby", async () => {
    submitContactMock.mockResolvedValue({
      status: "error",
      errors: { consent: "Please confirm you agree to the privacy policy." },
    } satisfies FormState);
    const { container } = render(<ContactForm />);
    submitForm(container);

    const error = await screen.findByText(/confirm you agree/i);
    const checkbox = screen.getByRole("checkbox", {
      name: /i agree to rise initiative storing my information/i,
    });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", error.id);
  });

  it("includes a hidden honeypot field", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector('input[name="company"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("shows an accessible confirmation after a successful submit", async () => {
    const { container } = render(<ContactForm />);
    submitForm(container);

    const confirmation = await screen.findByRole("status");
    expect(confirmation).toHaveTextContent(/we will be in touch/i);
    expect(
      screen.queryByRole("button", { name: /send|submit/i }),
    ).not.toBeInTheDocument();
  });

  it("shows field errors returned by the action", async () => {
    submitContactMock.mockResolvedValue({
      status: "error",
      errors: { email: "Please enter a valid email address." },
    } satisfies FormState);
    const { container } = render(<ContactForm />);
    submitForm(container);

    const error = await screen.findByText(/valid email address/i);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", error.id);
  });

  it("shows non-field errors in an alert box and keeps the form", async () => {
    submitContactMock.mockResolvedValue({
      status: "error",
      errors: { _form: "Too many submissions. Please try again later." },
    } satisfies FormState);
    const { container } = render(<ContactForm />);
    submitForm(container);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/too many submissions/i);
    expect(
      screen.getByRole("button", { name: /send|submit/i }),
    ).toBeInTheDocument();
  });
});
