"use client";

import { useActionState } from "react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Button } from "@/components/shared/Button";
import { PrivacyPolicyLink } from "@/components/shared/consent";
import { submitContact } from "@/lib/actions/submissions";
import type { FormState } from "@/lib/types";

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

const initialState: FormState = { status: "idle" };

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-primary">
      {" *"}
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-semibold text-danger">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState,
  );

  if (state.status === "success") {
    return (
      <section aria-labelledby="contact-form-heading">
        <Eyebrow>Send a message</Eyebrow>
        <h2
          id="contact-form-heading"
          className="text-section-title mt-3 text-ink"
        >
          Write to us.
        </h2>
        <div
          role="status"
          className="mt-8 rounded-lg border border-line bg-evergreen-50 p-6 text-ink"
        >
          <p className="leading-relaxed">
            Thank you, we have received your message and we will be in touch.
          </p>
        </div>
      </section>
    );
  }

  const errors = state.errors ?? {};
  const a11y = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });

  return (
    <section aria-labelledby="contact-form-heading">
      <Eyebrow>Send a message</Eyebrow>
      <h2
        id="contact-form-heading"
        className="text-section-title mt-3 text-ink"
      >
        Write to us.
      </h2>

      <form
        action={formAction}
        className="mt-8 rounded-lg border border-line/60 bg-surface-sunk/40 p-6 shadow-md sm:p-8"
      >
        <div className="flex flex-col gap-6">
          {/* Honeypot: hidden from humans, irresistible to bots. */}
          <div aria-hidden="true" tabIndex={-1} className="sr-only">
            <label htmlFor="contact-company">Company</label>
            <input
              id="contact-company"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {errors._form ? (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger"
            >
              {errors._form}
            </div>
          ) : null}

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
              {...a11y("fullName")}
            />
            <FieldError id="contact-fullName-error" message={errors.fullName} />
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
              {...a11y("email")}
            />
            <FieldError id="contact-email-error" message={errors.email} />
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
              {...a11y("role")}
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
            <FieldError id="contact-role-error" message={errors.role} />
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
              {...a11y("message")}
            />
            <FieldError id="contact-message-error" message={errors.message} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                id="contact-consent"
                name="consent"
                type="checkbox"
                required
                className="mt-1 size-5 shrink-0 rounded border-line text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                {...a11y("consent")}
              />
              <label
                htmlFor="contact-consent"
                className="font-body text-sm leading-relaxed text-ink"
              >
                I agree to RISE Initiative storing my information to respond to
                my enquiry, as described in the <PrivacyPolicyLink />.
                <RequiredMark />
              </label>
            </div>
            <FieldError id="contact-consent-error" message={errors.consent} />
          </div>

          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
