"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
  required?: boolean;
  autoComplete?: string;
};

type ApplicationFormProps = {
  /** Unique form key; used to namespace field ids so they stay stable and unique. */
  formName: string;
  fields: Field[];
  submitLabel: string;
  /** Sentence shown near the submit button (e.g. periodic-review reminder). */
  note: string;
};

/**
 * Accessible application form. Submission is deferred: there is no backend,
 * server action, or network call. Submitting shows a static confirmation.
 */
export function ApplicationForm({
  formName,
  fields,
  submitLabel,
  note,
}: ApplicationFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Submission is deferred; still enforce required/email constraints so an
    // empty form cannot reach the confirmation. The browser surfaces the
    // native validation messages.
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
  }

  return (
    <Container>
      <div className="max-w-2xl">
        {submitted ? (
          <div
            role="status"
            className="rounded-lg border border-line bg-evergreen-50 p-6 text-ink"
          >
            <p className="leading-relaxed">Thank you. {note}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {fields.map((field) => {
              const id = `${formName}-${field.name}`;
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
                      className="rounded-lg border border-line bg-surface px-4 py-3 text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  ) : (
                    <input
                      id={id}
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      autoComplete={field.autoComplete}
                      className="rounded-lg border border-line bg-surface px-4 py-3 text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  )}
                </div>
              );
            })}

            <p className="text-sm text-mist">{note}</p>

            <div>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
}
