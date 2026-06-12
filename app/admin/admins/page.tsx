import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import {
  createAdminAccount,
  deleteAdminAccount,
  setAdminActive,
  updateAdminAccount,
} from "@/lib/actions/admin";
import { db } from "@/lib/db";
import type { Admin, AdminRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLES: readonly AdminRole[] = ["superadmin", "owner", "reviewer"];

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super admin",
  owner: "Owner",
  reviewer: "Reviewer",
};

const labelClass = "block font-body text-sm font-semibold text-ink";
const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-primary";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover";
const ghostButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AdminRow({ admin, isSelf }: { admin: Admin; isSelf: boolean }) {
  return (
    <li
      className={`rounded-lg border border-line bg-surface p-5 ${
        admin.active ? "" : "opacity-60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {admin.name}{" "}
            {isSelf ? (
              <span className="font-body text-xs font-semibold text-muted">
                (you)
              </span>
            ) : null}
          </h3>
          <p className="mt-1 font-body text-sm text-muted">
            {admin.username} · {admin.email} · added {formatDate(admin.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold ${
              admin.active
                ? "bg-success-tint text-success"
                : "bg-charcoal-50 text-charcoal-700"
            }`}
          >
            {admin.active ? "Active" : "Inactive"}
          </span>
          <span className="inline-flex items-center rounded-pill bg-evergreen-50 px-3 py-1 font-body text-xs font-semibold text-evergreen-700">
            {ROLE_LABELS[admin.role]}
          </span>
        </div>
      </div>

      <form
        action={updateAdminAccount}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="id" value={admin.id} />
        <div>
          <label className={labelClass} htmlFor={`role-${admin.id}`}>
            Role
          </label>
          <select
            id={`role-${admin.id}`}
            name="role"
            defaultValue={admin.role}
            className={inputClass}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Update role
        </button>
      </form>

      {isSelf ? (
        <p className="mt-3 font-body text-sm text-muted">
          You cannot deactivate or delete your own account.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <form action={setAdminActive}>
            <input type="hidden" name="id" value={admin.id} />
            <input
              type="hidden"
              name="active"
              value={admin.active ? "false" : "true"}
            />
            <button type="submit" className={ghostButtonClass}>
              {admin.active ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form action={deleteAdminAccount}>
            <input type="hidden" name="id" value={admin.id} />
            <button type="submit" className={ghostButtonClass}>
              Delete admin
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

function CreateAdminForm() {
  return (
    <form
      action={createAdminAccount}
      className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2"
    >
      <div>
        <label className={labelClass} htmlFor="new-username">
          Username
        </label>
        <input
          id="new-username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={40}
          autoComplete="off"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="new-email">
          Email
        </label>
        <input
          id="new-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="new-name">
          Full name
        </label>
        <input
          id="new-name"
          name="name"
          type="text"
          required
          maxLength={120}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="new-role">
          Role
        </label>
        <select
          id="new-role"
          name="role"
          required
          defaultValue="reviewer"
          className={inputClass}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="new-password">
          Password (minimum 12 characters)
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className={primaryButtonClass}>
          Create admin
        </button>
      </div>
    </form>
  );
}

export default async function AdminAdminsPage() {
  const current = await requireAdmin();
  if (!can(current.role, "manage-admins")) notFound();

  const admins = await db.listAdmins();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Admin accounts
        </h1>
        <p className="mt-2 font-body text-sm text-muted">
          Manage who can sign in to the admin area and what they can do. The
          first admin account is created from the command line with{" "}
          <code className="rounded bg-surface-sunk px-1.5 py-0.5 font-mono text-xs">
            npm run create-admin
          </code>
          .
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Add an admin
        </h2>
        <div className="mt-4">
          <CreateAdminForm />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Existing admins
        </h2>
        {admins.length === 0 ? (
          <p className="mt-4 font-body text-sm text-muted">No admins yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                isSelf={admin.id === current.id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
