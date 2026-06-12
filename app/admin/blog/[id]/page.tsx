import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { blogStore } from "@/lib/db/blog";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!can(admin.role, "manage-blog")) notFound();

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const post = await blogStore.getById(id);
  if (!post) notFound();

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
          Edit post
        </h1>
      </div>
      <BlogEditor post={post} />
    </div>
  );
}
