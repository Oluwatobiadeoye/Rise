import type { Admin, AdminRole } from "@/lib/types";
import { assertAdmin } from "./auth";

/** A capability that an admin action requires. */
export type AdminAction =
  | "review-submissions"
  | "manage-cycles"
  | "manage-admins"
  | "manage-blog"
  | "view-notifications";

// The role -> capability matrix. Listing the roles allowed for each action
// keeps the policy in one place; `can` is a pure membership check.
const MATRIX: Record<AdminAction, readonly AdminRole[]> = {
  "manage-admins": ["superadmin"],
  "manage-cycles": ["superadmin", "owner"],
  "manage-blog": ["superadmin", "owner", "reviewer"],
  "review-submissions": ["superadmin", "owner", "reviewer"],
  "view-notifications": ["superadmin", "owner", "reviewer"],
};

/** Whether a role is permitted to perform an action. */
export function can(role: AdminRole, action: AdminAction): boolean {
  return MATRIX[action].includes(role);
}

/**
 * Server-action guard layered on {@link assertAdmin}: authenticates, then
 * throws "Forbidden" when the admin's role lacks the capability. Returns the
 * authenticated admin so callers can use its id/role.
 */
export async function requireCan(action: AdminAction): Promise<Admin> {
  const admin = await assertAdmin();
  if (!can(admin.role, action)) throw new Error("Forbidden");
  return admin;
}
