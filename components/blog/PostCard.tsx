import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import type { PostMeta } from "@/lib/content";

// UTC keeps a YYYY-MM-DD date from drifting a day in negative-offset zones.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-06-11" → "11 June 2026". */
export function formatPostDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

type PostCardProps = {
  post: PostMeta;
};

/** Listing row for a blog post; the whole row links to the post. */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative grid gap-5 sm:grid-cols-[minmax(0,17rem)_1fr] sm:items-center sm:gap-8">
      {post.cover ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg sm:aspect-[4/3]">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            sizes="(min-width: 640px) 17rem, 100vw"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <ImagePlaceholder
          label="Post photo to come"
          className="aspect-[16/9] sm:aspect-[4/3]"
        />
      )}

      <div>
        <time dateTime={post.date} className="text-sm text-slate">
          {formatPostDate(post.date)}
        </time>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-[-0.02em] text-ink">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 leading-relaxed text-slate">{post.excerpt}</p>
        <p className="mt-4 text-sm font-semibold text-ink">{post.author}</p>
      </div>
    </article>
  );
}
