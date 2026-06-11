import {
  ApplicationForm,
  type Field,
} from "@/components/get-involved/ApplicationForm";
import { submitVolunteer } from "@/lib/actions/submissions";

const volunteerFields: Field[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "interestArea",
    label: "Area of interest",
    type: "select",
    required: true,
    options: [
      { value: "Facilitation & training", label: "Facilitation & training" },
      { value: "Events & logistics", label: "Events & logistics" },
      { value: "Communications & media", label: "Communications & media" },
      { value: "Mentorship support", label: "Mentorship support" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "message",
    label: "Short message (optional)",
    type: "textarea",
  },
];

/** Volunteer interest form embedded on the Get involved hub. */
export function VolunteerForm() {
  return (
    <ApplicationForm
      formName="volunteer"
      fields={volunteerFields}
      submitLabel="Register your interest"
      note="We review volunteer interest periodically and will reach out when a suitable role opens."
      action={submitVolunteer}
      from="get-involved"
    />
  );
}
