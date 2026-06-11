import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        <p className="flex items-center gap-2 text-sm text-slate">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-[-0.02em] text-ink">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 leading-relaxed text-slate">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-ink">{post.author}</span>
          <span aria-hidden="true" className="text-line">|</span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            Read more
            <ArrowRight
              className="size-[15px] transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
