// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Admin, AdminRecord } from "@/lib/types";

vi.mock("server-only", () => ({}));

// Hoisted so the mock factories (themselves hoisted) can reference these.
const { cookieStore, dbMock } = vi.hoisted(() => ({
  cookieStore: { set: vi.fn(), delete: vi.fn() },
  dbMock: {
    getAdminByIdentifier: vi.fn(),
    getAdminById: vi.fn(),
    listAdmins: vi.fn(),
    setAdminActive: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => ({ get: () => null })),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/db", () => ({ db: dbMock }));

// verifyPassword is real (timing path), but rate limiting is always allowed.
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: () => true }));

// requireCan resolves the acting admin without touching the session.
const { actingAdmin } = vi.hoisted(() => ({
  actingAdmin: {
    id: "self-superadmin",
    username: "self",
    email: "self@example.com",
    name: "Self Admin",
    role: "superadmin" as const,
    active: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  } satisfies Admin,
}));
vi.mock("@/lib/admin/permissions", () => ({
  requireCan: vi.fn(async () => actingAdmin),
}));

import { hashPassword } from "@/lib/admin/password";
import { loginAdmin, setAdminActive } from "../admin";

const PASSWORD = "correct-horse-battery";

function admin(overrides: Partial<AdminRecord> = {}): AdminRecord {
  return {
    id: "other-superadmin",
    username: "ada",
    email: "ada@example.com",
    name: "Ada",
    role: "superadmin",
    active: true,
    passwordHash: hashPassword(PASSWORD),
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "a-high-entropy-test-session-secret");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("loginAdmin", () => {
  it("signs in an active account with the right password", async () => {
    dbMock.getAdminByIdentifier.mockResolvedValue(admin());
    await expect(
      loginAdmin(form({ identifier: "ada", password: PASSWORD })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin");
    expect(cookieStore.set).toHaveBeenCalledOnce();
  });

  it("rejects an inactive account through the generic failure path", async () => {
    dbMock.getAdminByIdentifier.mockResolvedValue(admin({ active: false }));
    await expect(
      loginAdmin(form({ identifier: "ada", password: PASSWORD })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/login?error=1");
    // No session is issued for a deactivated account.
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects a wrong password the same way", async () => {
    dbMock.getAdminByIdentifier.mockResolvedValue(admin());
    await expect(
      loginAdmin(form({ identifier: "ada", password: "wrong-password" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/login?error=1");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("setAdminActive", () => {
  it("deactivates another admin when superadmins remain", async () => {
    dbMock.getAdminById.mockResolvedValue(
      admin({ id: "other-superadmin", active: true }),
    );
    dbMock.listAdmins.mockResolvedValue([
      { ...actingAdmin },
      admin({ id: "other-superadmin" }),
    ]);
    await setAdminActive(form({ id: "other-superadmin", active: "false" }));
    expect(dbMock.setAdminActive).toHaveBeenCalledWith(
      "other-superadmin",
      false,
    );
  });

  it("refuses to deactivate your own account", async () => {
    await expect(
      setAdminActive(form({ id: actingAdmin.id, active: "false" })),
    ).rejects.toThrow(/your own account/i);
    expect(dbMock.setAdminActive).not.toHaveBeenCalled();
  });

  it("refuses to deactivate the last active superadmin", async () => {
    dbMock.getAdminById.mockResolvedValue(
      admin({ id: "other-superadmin", active: true }),
    );
    // The acting superadmin is inactive here, so the target is the only active one.
    dbMock.listAdmins.mockResolvedValue([admin({ id: "other-superadmin" })]);
    await expect(
      setAdminActive(form({ id: "other-superadmin", active: "false" })),
    ).rejects.toThrow(/last active superadmin/i);
    expect(dbMock.setAdminActive).not.toHaveBeenCalled();
  });

  it("rejects an invalid active flag", async () => {
    await expect(
      setAdminActive(form({ id: "other-superadmin", active: "maybe" })),
    ).rejects.toThrow(/invalid active flag/i);
  });
});
