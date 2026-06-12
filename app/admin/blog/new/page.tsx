import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const admin = await requireAdmin();
  if (!can(admin.role, "manage-blog")) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/blog"
          className="font-body text-sm font-semibold text-primary hover:text-primary-press"
        >
          ← Back to blog
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">
          New post
        </h1>
      </div>
      <BlogEditor post={null} />
    </div>
  );
}
