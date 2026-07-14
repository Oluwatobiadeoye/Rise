"use client";

import { useActionState } from "react";
import { Button } from "@/components/shared/Button";
import { PrivacyPolicyLink } from "@/components/shared/consent";
import { submitNotifyMe } from "@/lib/actions/submissions";
import type { CycleRole, FormState } from "@/lib/types";

const initialState: FormState = { status: "idle" };

/** Captures an email to notify when the next application cycle opens. */
export function NotifyMeForm({ role }: { role: CycleRole }) {
  const [state, formAction, isPending] = useActionState(
    submitNotifyMe,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-line bg-evergreen-50 p-6 text-ink"
      >
        <p className="leading-relaxed">
          Thank you. We will email you when the next cycle opens.
        </p>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const emailErrorId = `notify-${role}-email-error`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="role" value={role} />

      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <div aria-hidden="true" tabIndex={-1} className="sr-only">
        <label htmlFor={`notify-${role}-company`}>Company</label>
        <input
          id={`notify-${role}-company`}
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

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`notify-${role}-email`}
          className="font-body text-sm font-semibold text-ink"
        >
          Email address
          <span aria-hidden="true" className="text-primary">
            {" *"}
          </span>
        </label>
        <input
          id={`notify-${role}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="rounded-lg border border-line bg-surface px-4 py-3 text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        {errors.email ? (
          <p id={emailErrorId} className="text-sm font-semibold text-danger">
            {errors.email}
          </p>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-slate">
        We will only use your email to tell you when the next cycle opens. See
        our <PrivacyPolicyLink />.
      </p>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Notify me"}
        </Button>
      </div>
    </form>
  );
}
