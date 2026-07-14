import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PostMeta } from "@/lib/content/types";
import BlogPage from "../page";
import { routes } from "@/lib/site";

const listPosts = vi.fn<() => Promise<PostMeta[]>>();

vi.mock("@/lib/content", () => ({
  content: {
    listPosts: () => listPosts(),
    getPost: vi.fn(),
  },
}));

describe("Blog page (empty launch state)", () => {
  it("shows the empty state with its call to action", async () => {
    listPosts.mockResolvedValue([]);
    render(await BlogPage());

    expect(
      screen.getByRole("heading", { name: "Stories are coming." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Follow our journey" }),
    ).toHaveAttribute("href", routes.getInvolved);
  });

  it("keeps the page header around the empty state", async () => {
    listPosts.mockResolvedValue([]);
    render(await BlogPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Stories from RISE." }),
    ).toBeInTheDocument();
  });
});

describe("Blog page (with posts)", () => {
  it("lists a card per post instead of the empty state", async () => {
    listPosts.mockResolvedValue([
      {
        slug: "welcoming-our-first-cohort",
        title: "Welcoming our first cohort",
        date: "2026-01-10",
        excerpt: "Meet the students starting their RISE journey this year.",
        author: "Dara Olawale",
        readingMinutes: 3,
        cover: null,
      },
    ]);
    render(await BlogPage());

    expect(
      screen.getByRole("link", { name: "Welcoming our first cohort" }),
    ).toHaveAttribute("href", "/blog/welcoming-our-first-cohort");
    expect(screen.queryByText("Stories are coming.")).not.toBeInTheDocument();
  });
});
