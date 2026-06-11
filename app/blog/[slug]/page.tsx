import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { formatPostDate } from "@/components/blog/PostCard";
import { content } from "@/lib/content";

type PageParams = { slug: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  const posts = await content.listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      ...(post.cover
        ? {
            images: [
              {
                url: post.cover.src,
                width: post.cover.width,
                height: post.cover.height,
                alt: post.cover.alt,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = await content.getPost(slug);
  if (!post) notFound();

  return (
    <article className="py-14 sm:py-18">
      <Container>
        <header className="mx-auto max-w-3xl">
          <Eyebrow>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
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
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
      </Container>
    </article>
  );
}
