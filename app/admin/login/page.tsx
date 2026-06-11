import { notFound } from "next/navigation";
import { loginAdmin } from "@/lib/actions/admin";
import { isAdminConfigured } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isAdminConfigured()) notFound();

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-bold text-ink">Admin sign in</h1>
      <p className="mt-2 font-body text-sm text-muted">
        Enter the admin password to review submissions and application cycles.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-md border border-danger/30 bg-charcoal-50 px-4 py-3 font-body text-sm text-danger"
        >
          Incorrect password, or too many attempts. Please try again.
        </p>
      ) : null}

      <form action={loginAdmin} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block font-body text-sm font-semibold text-ink"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2.5 font-body text-sm text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-tint"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
