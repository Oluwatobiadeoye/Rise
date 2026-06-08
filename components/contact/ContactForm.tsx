"use client";

import { useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Button } from "@/components/shared/Button";

const roles: ReadonlyArray<string> = [
  "Student",
  "Professional",
  "School",
  "Organisation",
  "Other",
];

const fieldClass =
  "mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-ink " +
  "placeholder:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-primary";

const labelClass = "font-body text-sm font-semibold text-ink";

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-primary">
      {" *"}
    </span>
  );
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  // No submit endpoint is wired yet; preventing default keeps this inert
  // and we surface a static confirmation instead of a silent action.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section aria-labelledby="contact-form-heading">
      <Eyebrow>Send a message</Eyebrow>
      <h2
        id="contact-form-heading"
        className="text-section-title mt-3 text-ink"
      >
        Write to us.
      </h2>

      {submitted ? (
        <div
          role="status"
          className="mt-8 rounded-lg border border-line bg-evergreen-50 p-6 text-ink"
        >
          <p className="leading-relaxed">
            Thank you. Messages are reviewed periodically and we will be in
            touch.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-lg border border-line/60 bg-surface-sunk/40 p-6 shadow-md sm:p-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="contact-full-name" className={labelClass}>
                Full name
                <RequiredMark />
              </label>
              <input
                id="contact-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email address
                <RequiredMark />
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="contact-role" className={labelClass}>
                I am a:
                <RequiredMark />
              </label>
              <select
                id="contact-role"
                name="role"
                defaultValue=""
                required
                className={fieldClass}
              >
                <option value="" disabled>
                  Select one
                </option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message
                <RequiredMark />
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className={`${fieldClass} resize-y`}
              />
            </div>

            <div>
              <Button type="submit">Send message</Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
