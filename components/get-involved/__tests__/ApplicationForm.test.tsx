import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationForm, type Field } from "../ApplicationForm";

const fields: Field[] = [
  { name: "full-name", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email address", type: "email", required: true },
  { name: "essay", label: "Short essay", type: "textarea", required: true },
];

function renderForm() {
  return render(
    <ApplicationForm
      formName="sample"
      fields={fields}
      submitLabel="Apply now"
      note="Applications open periodically."
    />,
  );
}

describe("ApplicationForm", () => {
  it("renders each field with an accessible label", () => {
    renderForm();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short essay/i)).toBeInTheDocument();
  });

  it("generates stable, namespaced field ids", () => {
    renderForm();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute(
      "id",
      "sample-full-name",
    );
  });

  it("renders the submit control and periodic-review note", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: /apply now/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/applications open periodically/i),
    ).toBeInTheDocument();
  });

  function fillRequiredFields() {
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Ada Obi" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/short essay/i), {
      target: { value: "My motivation." },
    });
  }

  it("does not navigate on submit and shows an inline confirmation when valid", () => {
    renderForm();
    fillRequiredFields();

    const form = screen
      .getByRole("button", { name: /apply now/i })
      .closest("form");
    expect(form).not.toBeNull();

    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(form as HTMLFormElement, submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(
      screen.getByText(/applications open periodically/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply now/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show the confirmation when required fields are empty", () => {
    renderForm();

    const form = screen
      .getByRole("button", { name: /apply now/i })
      .closest("form") as HTMLFormElement;

    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(form, submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    // The submit control is still present; no confirmation rendered.
    expect(
      screen.getByRole("button", { name: /apply now/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
