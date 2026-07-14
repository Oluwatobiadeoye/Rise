import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { blogStore } from "@/lib/db/blog";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { formatPostDate } from "@/components/blog/PostCard";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PreviewBlogPostPage({
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

  const displayDate = (post.publishedAt ?? post.createdAt).slice(0, 10);
  const bodyHtml = sanitizePostHtml(post.bodyHtml);

  return (
    <div>
      <div className="border-b border-line bg-surface-sunk py-3">
        <Container>
          <p className="font-body text-sm text-muted">
            Preview ({post.status}). Not the public page.{" "}
            <Link
              href={`/admin/blog/${post.id}`}
              className="font-semibold text-primary hover:underline"
            >
              ← Back to editor
            </Link>
          </p>
        </Container>
      </div>

      <article className="py-14 sm:py-18">
        <Container>
          <header className="mx-auto max-w-3xl">
            <Eyebrow>
              <time dateTime={displayDate}>{formatPostDate(displayDate)}</time>
            </Eyebrow>
            <h1 className="text-display mt-3 text-ink">{post.title}</h1>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-slate">
              <span>
                By <span className="font-semibold text-ink">{post.author}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </p>
            {post.cover ? (
              <Image
                src={post.cover.src}
                alt={post.cover.alt}
                width={post.cover.width}
                height={post.cover.height}
                sizes="(min-width: 768px) 768px, 100vw"
                priority
                className="mt-8 w-full rounded-xl object-cover shadow-evergreen"
              />
            ) : null}
          </header>

          <div
            className="post-body mx-auto mt-10 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </Container>
      </article>
    </div>
  );
}
