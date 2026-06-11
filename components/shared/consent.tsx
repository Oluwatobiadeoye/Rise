import Link from "next/link";
import type { Field } from "@/components/get-involved/ApplicationForm";
import { routes } from "@/lib/site";

/** Reusable link to the privacy policy, styled for inline use within copy. */
export function PrivacyPolicyLink({ className }: { className?: string }) {
  return (
    <Link
      href={routes.privacy}
      className={
        className ??
        "font-semibold text-primary underline transition-colors hover:text-primary-press"
      }
    >
      privacy policy
    </Link>
  );
}

/**
 * The required consent checkbox shown at the point of collection. The action
 * verb varies by form ("respond to my enquiry" vs "process my application").
 */
export function consentField(purpose: string): Field {
  return {
    name: "consent",
    label: `I agree to RISE Initiative storing my information to ${purpose}, as described in the privacy policy.`,
    type: "checkbox",
    required: true,
    labelNode: (
      <>
        I agree to RISE Initiative storing my information to {purpose}, as
        described in the <PrivacyPolicyLink />.
      </>
    ),
  };
}
