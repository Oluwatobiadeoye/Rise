// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  validateContact,
  validateMentee,
  validateMentor,
  validateNotifyMe,
  validateVolunteer,
} from "../validation";

function formDataOf(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

const validContact = {
  fullName: "Ada Obi",
  email: "Ada@Example.COM",
  role: "Student",
  message: "Hello RISE.",
};

const validMentor = {
  fullName: "Ada Obi",
  email: "ada@example.com",
  fieldOfExpertise: "Software engineering",
  audiencePreference: "tertiary",
  availability: "monthly",
  message: "Happy to help.",
};

const validMentee = {
  fullName: "Bisi Ade",
  email: "bisi@example.com",
  institution: "LAUTECH",
  dateOfBirth: "2004-05-12",
  essay: "My background, goals, and motivation.",
};

const validVolunteer = {
  fullName: "Ada Obi",
  email: "ada@example.com",
  interestArea: "Events & logistics",
  message: "",
};

describe("validateContact", () => {
  it("accepts a valid payload, trimming and lowercasing the email", () => {
    const result = validateContact(
      formDataOf({ ...validContact, fullName: "  Ada Obi  " }),
    );
    expect(result).toEqual({
      ok: true,
      data: {
        fullName: "Ada Obi",
        email: "ada@example.com",
        role: "Student",
        message: "Hello RISE.",
      },
    });
  });

  it("reports every missing field", () => {
    const result = validateContact(formDataOf({}));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "email",
        "fullName",
        "message",
        "role",
      ]);
    }
  });

  it("rejects malformed and overlong emails", () => {
    for (const email of [
      "not-an-email",
      "a@b",
      "a b@c.com",
      `${"x".repeat(250)}@example.com`,
    ]) {
      const result = validateContact(formDataOf({ ...validContact, email }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.email).toMatch(/valid email/i);
      }
    }
  });

  it("rejects fields over their maximum lengths", () => {
    const longName = validateContact(
      formDataOf({ ...validContact, fullName: "x".repeat(201) }),
    );
    expect(longName.ok).toBe(false);

    const longMessage = validateContact(
      formDataOf({ ...validContact, message: "x".repeat(5001) }),
    );
    expect(longMessage.ok).toBe(false);

    const maxMessage = validateContact(
      formDataOf({ ...validContact, message: "x".repeat(5000) }),
    );
    expect(maxMessage.ok).toBe(true);
  });
});

describe("validateMentor", () => {
  it("accepts a valid payload", () => {
    const result = validateMentor(formDataOf(validMentor));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.audiencePreference).toBe("tertiary");
      expect(result.data.availability).toBe("monthly");
    }
  });

  it("treats an empty optional message as null", () => {
    const result = validateMentor(formDataOf({ ...validMentor, message: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.message).toBeNull();
  });

  it("rejects values outside the audience and availability enums", () => {
    const badAudience = validateMentor(
      formDataOf({ ...validMentor, audiencePreference: "anyone" }),
    );
    expect(badAudience.ok).toBe(false);
    if (!badAudience.ok) {
      expect(badAudience.errors.audiencePreference).toBeTruthy();
    }

    const badAvailability = validateMentor(
      formDataOf({ ...validMentor, availability: "weekly" }),
    );
    expect(badAvailability.ok).toBe(false);
    if (!badAvailability.ok) {
      expect(badAvailability.errors.availability).toBeTruthy();
    }
  });
});

describe("validateMentee", () => {
  it("accepts a valid payload", () => {
    expect(validateMentee(formDataOf(validMentee)).ok).toBe(true);
  });

  it("rejects malformed dates of birth", () => {
    for (const dateOfBirth of ["12/05/2004", "2004-5-12", "yesterday", ""]) {
      const result = validateMentee(formDataOf({ ...validMentee, dateOfBirth }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.dateOfBirth).toMatch(/valid date/i);
      }
    }
  });

  it("rejects impossible calendar dates", () => {
    for (const dateOfBirth of ["2004-02-30", "2003-13-01", "2003-04-31"]) {
      const result = validateMentee(formDataOf({ ...validMentee, dateOfBirth }));
      expect(result.ok).toBe(false);
    }
    // 2004 was a leap year.
    expect(
      validateMentee(formDataOf({ ...validMentee, dateOfBirth: "2004-02-29" }))
        .ok,
    ).toBe(true);
  });

  it("rejects dates of birth in the future", () => {
    const nextYear = new Date().getUTCFullYear() + 1;
    const result = validateMentee(
      formDataOf({ ...validMentee, dateOfBirth: `${nextYear}-01-01` }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.dateOfBirth).toMatch(/future/i);
    }
  });

  it("requires the essay", () => {
    const result = validateMentee(formDataOf({ ...validMentee, essay: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.essay).toBeTruthy();
  });
});

describe("validateVolunteer", () => {
  it("accepts a valid payload with a null optional message", () => {
    const result = validateVolunteer(formDataOf(validVolunteer));
    expect(result).toEqual({
      ok: true,
      data: {
        fullName: "Ada Obi",
        email: "ada@example.com",
        interestArea: "Events & logistics",
        message: null,
      },
    });
  });

  it("requires an interest area", () => {
    const result = validateVolunteer(
      formDataOf({ ...validVolunteer, interestArea: "" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.interestArea).toBeTruthy();
  });
});

describe("validateNotifyMe", () => {
  it("accepts mentor and mentee roles", () => {
    for (const role of ["mentor", "mentee"]) {
      const result = validateNotifyMe(
        formDataOf({ role, email: "ada@example.com" }),
      );
      expect(result.ok).toBe(true);
    }
  });

  it("rejects unknown roles and bad emails", () => {
    const badRole = validateNotifyMe(
      formDataOf({ role: "sponsor", email: "ada@example.com" }),
    );
    expect(badRole.ok).toBe(false);

    const badEmail = validateNotifyMe(
      formDataOf({ role: "mentor", email: "nope" }),
    );
    expect(badEmail.ok).toBe(false);
  });
});
