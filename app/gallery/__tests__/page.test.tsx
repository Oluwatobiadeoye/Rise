import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { GalleryItem } from "@/lib/content/types";
import GalleryPage from "../page";
import { routes } from "@/lib/site";

const listGalleryItems = vi.fn<() => Promise<GalleryItem[]>>();

vi.mock("@/lib/content", () => ({
  content: {
    listPosts: vi.fn(),
    getPost: vi.fn(),
    listGalleryItems: () => listGalleryItems(),
  },
}));

describe("Gallery page (empty launch state)", () => {
  it("shows the empty state with its call to action", async () => {
    listGalleryItems.mockResolvedValue([]);
    render(await GalleryPage());

    expect(
      screen.getByRole("heading", { name: "The album starts soon." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See our past projects" }),
    ).toHaveAttribute("href", routes.foundationsOfImpact);
  });

  it("keeps the page header around the empty state", async () => {
    listGalleryItems.mockResolvedValue([]);
    render(await GalleryPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Moments from the field.",
      }),
    ).toBeInTheDocument();
  });
});

describe("Gallery page (with items)", () => {
  it("renders the photo grid instead of the empty state", async () => {
    listGalleryItems.mockResolvedValue([
      {
        id: "bootcamp-opening",
        src: "/gallery/bootcamp-opening.jpg",
        alt: "Students at the bootcamp opening ceremony",
        caption: null,
        width: 1600,
        height: 1200,
        takenAt: null,
      },
    ]);
    render(await GalleryPage());

    expect(
      screen.getByRole("img", {
        name: "Students at the bootcamp opening ceremony",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("The album starts soon."),
    ).not.toBeInTheDocument();
  });
});
