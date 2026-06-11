import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationForm, type Field } from "../ApplicationForm";
import type { FormState } from "@/lib/types";

const fields: Field[] = [
  { name: "fullName", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email address", type: "email", required: true },
  {
    name: "audiencePreference",
    label: "Who would you like to mentor?",
    type: "select",
    required: true,
    options: [
      { value: "tertiary", label: "Tertiary students" },
      { value: "either", label: "Open to either" },
    ],
  },
  { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
  { name: "essay", label: "Short essay", type: "textarea", required: true },
];

function renderForm({
  action = vi.fn(async (): Promise<FormState> => ({ status: "success" })),
  from = null as string | null,
} = {}) {
  const view = render(
    <ApplicationForm
      formName="sample"
      fields={fields}
      submitLabel="Apply now"
      note="Applications open periodically."
      action={action}
      from={from}
    />,
  );
  return { ...view, action };
}

function submitForm(container: HTMLElement) {
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

describe("ApplicationForm", () => {
  it("renders each field type with an accessible label", () => {
    renderForm();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /who would you like to mentor/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toHaveAttribute(
      "type",
      "date",
    );
    expect(screen.getByLabelText(/short essay/i)).toBeInTheDocument();
  });

  it("generates stable, namespaced field ids", () => {
    renderForm();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute(
      "id",
      "sample-fullName",
    );
  });

  it("renders the submit control and review note", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: /apply now/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/applications open periodically/i),
    ).toBeInTheDocument();
  });

  it("includes a hidden honeypot field", () => {
    const { container } = renderForm();
    const honeypot = container.querySelector('input[name="company"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("renders a hidden from input only for a provided slug", () => {
    const { container } = renderForm({ from: "home" });
    const fromInput = container.querySelector('input[name="from"]');
    expect(fromInput).toHaveAttribute("value", "home");
    expect(fromInput).toHaveAttribute("type", "hidden");

    const { container: bare } = renderForm();
    expect(bare.querySelector('input[name="from"]')).toBeNull();
  });

  it("disables the submit button while the action is pending", async () => {
    let resolve!: (state: FormState) => void;
    const action = vi.fn(
      () => new Promise<FormState>((r) => (resolve = r)),
    );
    const { container } = renderForm({ action });

    submitForm(container);

    const pending = await screen.findByRole("button", {
      name: /submitting/i,
    });
    expect(pending).toBeDisabled();

    resolve({ status: "success" });
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("shows the confirmation when the action succeeds", async () => {
    const { container } = renderForm();
    submitForm(container);

    const confirmation = await screen.findByRole("status");
    expect(confirmation).toHaveTextContent(/we have received your submission/i);
    expect(
      screen.queryByRole("button", { name: /apply now/i }),
    ).not.toBeInTheDocument();
  });

  it("shows inline field errors wired through aria-describedby", async () => {
    const action = vi.fn(
      async (): Promise<FormState> => ({
        status: "error",
        errors: { email: "Please enter a valid email address." },
      }),
    );
    const { container } = renderForm({ action });
    submitForm(container);

    const error = await screen.findByText(/valid email address/i);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", error.id);
  });

  it("shows non-field errors in an alert box", async () => {
    const action = vi.fn(
      async (): Promise<FormState> => ({
        status: "error",
        errors: { _form: "Applications are currently closed." },
      }),
    );
    const { container } = renderForm({ action });
    submitForm(container);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/currently closed/i);
    // The form stays available for retry.
    expect(
      screen.getByRole("button", { name: /apply now/i }),
    ).toBeInTheDocument();
  });
});
