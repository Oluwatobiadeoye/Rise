import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard, formatPostDate } from "../PostCard";
import type { PostMeta } from "@/lib/content";

const basePost: PostMeta = {
  slug: "welcoming-our-first-cohort",
  title: "Welcoming our first cohort",
  date: "2026-01-10",
  excerpt: "Meet the students starting their RISE journey this year.",
  author: "Dara Olawale",
  readingMinutes: 3,
  cover: null,
};

const coveredPost: PostMeta = {
  ...basePost,
  slug: "bootcamp-recap",
  title: "Bootcamp recap",
  cover: {
    src: "/blog/bootcamp-recap/cover.jpg",
    alt: "Students gathered outside the bootcamp venue",
    width: 1600,
    height: 900,
  },
};

describe("formatPostDate", () => {
  it("formats an ISO date for display", () => {
    expect(formatPostDate("2026-01-10")).toBe("10 January 2026");
  });
});

describe("PostCard", () => {
  it("renders the title as a link to the post", () => {
    render(<PostCard post={basePost} />);
    expect(
      screen.getByRole("link", { name: "Welcoming our first cohort" }),
    ).toHaveAttribute("href", "/blog/welcoming-our-first-cohort");
  });

  it("renders the date, excerpt, and author", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("10 January 2026")).toBeInTheDocument();
    expect(
      screen.getByText(/Meet the students starting their RISE journey/),
    ).toBeInTheDocument();
    expect(screen.getByText("Dara Olawale")).toBeInTheDocument();
  });

  it("renders the cover image with its dimensions when present", () => {
    render(<PostCard post={coveredPost} />);
    const img = screen.getByRole("img", {
      name: "Students gathered outside the bootcamp venue",
    });
    expect(img).toHaveAttribute("src", "/blog/bootcamp-recap/cover.jpg");
    expect(img).toHaveAttribute("width", "1600");
    expect(img).toHaveAttribute("height", "900");
  });

  it("falls back to a placeholder when there is no cover", () => {
    render(<PostCard post={basePost} />);
    expect(
      screen.getByRole("img", { name: /placeholder/i }),
    ).toBeInTheDocument();
  });
});
