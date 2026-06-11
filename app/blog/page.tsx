import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PostCard } from "@/components/blog/PostCard";
import { content } from "@/lib/content";
import { routes } from "@/lib/site";

const description =
  "News, stories, and updates from RISE Initiative: programme milestones, mentorship insights, and the journeys of the young people we work with.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description,
    url: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await content.listPosts();

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Stories from RISE."
        lede="Updates from our programmes and the people behind them: what we are building, what we are learning, and the young leaders making it happen."
      />

      <section className="py-14 sm:py-18">
        <Container>
          {posts.length > 0 ? (
            <ul className="mx-auto flex max-w-4xl flex-col divide-y divide-line">
              {posts.map((post) => (
                <li key={post.slug} className="py-8 first:pt-0 last:pb-0">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Newspaper className="size-6" />}
              title="Stories are coming."
              body="We are getting ready to share updates from our first cohort: programme news, mentorship stories, and lessons from the field. Check back soon."
              cta={{ label: "Follow our journey", href: routes.getInvolved }}
            />
          )}
        </Container>
      </section>
    </>
  );
}
