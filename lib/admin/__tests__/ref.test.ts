import { describe, expect, it } from "vitest";
import { isSubmissionType, validateSubmissionRef } from "../ref";

const VALID_UUID = "0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d";

describe("isSubmissionType", () => {
  it("accepts the known submission types", () => {
    for (const type of ["contact", "mentor", "mentee", "volunteer"]) {
      expect(isSubmissionType(type)).toBe(true);
    }
  });

  it("rejects unknown or non-string values", () => {
    expect(isSubmissionType("admin")).toBe(false);
    expect(isSubmissionType("")).toBe(false);
    expect(isSubmissionType(null)).toBe(false);
    expect(isSubmissionType(42)).toBe(false);
  });
});

describe("validateSubmissionRef", () => {
  it("returns the narrowed reference for a valid type and UUID", () => {
    expect(validateSubmissionRef("mentor", VALID_UUID)).toEqual({
      type: "mentor",
      id: VALID_UUID,
    });
  });

  it("accepts an uppercase UUID", () => {
    expect(validateSubmissionRef("contact", VALID_UUID.toUpperCase())).not.toBe(
      null,
    );
  });

  it("rejects an invalid type", () => {
    expect(validateSubmissionRef("bogus", VALID_UUID)).toBe(null);
  });

  it("rejects a non-UUID id", () => {
    expect(validateSubmissionRef("mentor", "not-a-uuid")).toBe(null);
    expect(validateSubmissionRef("mentor", "")).toBe(null);
    expect(validateSubmissionRef("mentor", "1234")).toBe(null);
  });

  it("rejects path-traversal attempts in the id", () => {
    expect(validateSubmissionRef("mentor", "../../etc/passwd")).toBe(null);
    expect(validateSubmissionRef("mentor", `${VALID_UUID}/../foo`)).toBe(null);
    expect(validateSubmissionRef("mentor", "..%2f..%2fsecret")).toBe(null);
  });

  it("rejects non-string inputs", () => {
    expect(validateSubmissionRef(null, VALID_UUID)).toBe(null);
    expect(validateSubmissionRef("mentor", null)).toBe(null);
    expect(validateSubmissionRef(undefined, undefined)).toBe(null);
  });
});
