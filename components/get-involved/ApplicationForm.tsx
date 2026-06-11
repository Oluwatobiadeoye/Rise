"use client";

import { useActionState } from "react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import type { FormState } from "@/lib/types";

export type FieldOption = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "date";
  required?: boolean;
  autoComplete?: string;
  /** Options for `select` fields. */
  options?: ReadonlyArray<FieldOption>;
};

type ApplicationFormProps = {
  /** Unique form key; used to namespace field ids so they stay stable and unique. */
  formName: string;
  fields: Field[];
  submitLabel: string;
  /** Sentence shown near the submit button (e.g. periodic-review reminder). */
  note: string;
  /** Server action invoked with the form data. */
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Sanitized referrer slug recorded with the submission. */
  from?: string | null;
};

const fieldClass =
  "rounded-lg border border-line bg-surface px-4 py-3 text-ink outline-none " +
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40";

const initialState: FormState = { status: "idle" };

/** Accessible application form submitting through a server action. */
export function ApplicationForm({
  formName,
  fields,
  submitLabel,
  note,
  action,
  from = null,
}: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (state.status === "success") {
    return (
      <Container>
        <div className="max-w-2xl">
          <div
            role="status"
            className="rounded-lg border border-line bg-evergreen-50 p-6 text-ink"
          >
            <p className="leading-relaxed">
              Thank you, we have received your submission. {note}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  const formError = state.errors?._form;

  return (
    <Container>
      <div className="max-w-2xl">
        <form action={formAction} className="flex flex-col gap-6">
          {from ? <input type="hidden" name="from" value={from} /> : null}

          {/* Honeypot: hidden from humans, irresistible to bots. */}
          <div aria-hidden="true" tabIndex={-1} className="sr-only">
            <label htmlFor={`${formName}-company`}>Company</label>
            <input
              id={`${formName}-company`}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger"
            >
              {formError}
            </div>
          ) : null}

          {fields.map((field) => {
            const id = `${formName}-${field.name}`;
            const error = state.errors?.[field.name];
            const errorId = `${id}-error`;
            const a11y = {
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error ? errorId : undefined,
            };
            return (
              <div key={field.name} className="flex flex-col gap-2">
                <label
                  htmlFor={id}
                  className="font-body text-sm font-semibold text-ink"
                >
                  {field.label}
                  {field.required ? (
                    <span aria-hidden="true" className="text-primary">
                      {" *"}
                    </span>
                  ) : null}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={id}
                    name={field.name}
                    required={field.required}
                    rows={5}
                    className={fieldClass}
                    {...a11y}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={id}
                    name={field.name}
                    required={field.required}
                    defaultValue=""
                    className={fieldClass}
                    {...a11y}
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    autoComplete={field.autoComplete}
                    className={fieldClass}
                    {...a11y}
                  />
                )}
                {error ? (
                  <p id={errorId} className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}

          <p className="text-sm text-slate">{note}</p>

          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting…" : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
