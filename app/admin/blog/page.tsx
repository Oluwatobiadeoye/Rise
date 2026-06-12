import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { blogStore } from "@/lib/db/blog";
import type { PostStatus } from "@/lib/content/types";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<PostStatus, string> = {
  published: "bg-success-tint text-success",
  draft: "bg-charcoal-50 text-charcoal-700",
  archived: "bg-charcoal-50 text-muted",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBlogPage() {
  const admin = await requireAdmin();
  if (!can(admin.role, "manage-blog")) notFound();

  const posts = await blogStore.listAll();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
          <p className="mt-2 font-body text-sm text-muted">
            Write and publish posts. Drafts are private; published posts appear
            on the public site immediately.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-5 py-6 font-body text-sm text-muted">
          No posts yet. Create your first one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-sunk text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-line last:border-0 hover:bg-surface-sunk"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="font-semibold text-primary hover:text-primary-press"
                    >
                      {post.title || "(untitled)"}
                    </Link>
                    <div className="font-body text-xs text-muted">/blog/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold ${STATUS_STYLE[post.status]}`}
                    >
                      {STATUS_LABEL[post.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
