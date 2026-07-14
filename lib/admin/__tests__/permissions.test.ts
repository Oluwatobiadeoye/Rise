// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// permissions.ts imports auth.ts (for requireCan), which pulls in server-only,
// next/headers, next/navigation, and the store. These tests only exercise the
// pure `can` matrix, so stub those module-level imports.
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { getAdminById: vi.fn() } }));

import { can } from "../permissions";
import type { AdminAction } from "../permissions";
import type { AdminRole } from "@/lib/types";

// The expected allow matrix, mirrored here so the test fails loudly if the
// policy in permissions.ts drifts.
const EXPECTED: Record<AdminRole, Record<AdminAction, boolean>> = {
  superadmin: {
    "manage-admins": true,
    "manage-cycles": true,
    "manage-blog": true,
    "review-submissions": true,
    "view-notifications": true,
  },
  owner: {
    "manage-admins": false,
    "manage-cycles": true,
    "manage-blog": true,
    "review-submissions": true,
    "view-notifications": true,
  },
  reviewer: {
    "manage-admins": false,
    "manage-cycles": false,
    "manage-blog": true,
    "review-submissions": true,
    "view-notifications": true,
  },
};

describe("can", () => {
  for (const role of Object.keys(EXPECTED) as AdminRole[]) {
    for (const action of Object.keys(EXPECTED[role]) as AdminAction[]) {
      const expected = EXPECTED[role][action];
      it(`${role} ${expected ? "can" : "cannot"} ${action}`, () => {
        expect(can(role, action)).toBe(expected);
      });
    }
  }

  it("only superadmin can manage admins", () => {
    expect(can("superadmin", "manage-admins")).toBe(true);
    expect(can("owner", "manage-admins")).toBe(false);
    expect(can("reviewer", "manage-admins")).toBe(false);
  });
});
