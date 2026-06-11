import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryGrid } from "../GalleryGrid";
import type { GalleryItem } from "@/lib/content";

const items: GalleryItem[] = [
  {
    id: "bootcamp-opening",
    src: "/gallery/bootcamp-opening.jpg",
    alt: "Students at the bootcamp opening ceremony",
    caption: "Opening day",
    width: 1600,
    height: 1200,
    takenAt: "2026-03-02",
  },
  {
    id: "mentor-circle",
    src: "/gallery/mentor-circle.jpg",
    alt: "Mentors and mentees seated in a circle",
    caption: null,
    width: 1600,
    height: 1067,
    takenAt: null,
  },
];

describe("GalleryGrid", () => {
  it("renders a thumbnail per item with its image source", () => {
    render(<GalleryGrid items={items} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/gallery/bootcamp-opening.jpg");
    expect(images[1]).toHaveAttribute("src", "/gallery/mentor-circle.jpg");
  });

  it("folds the caption into the accessible image text", () => {
    render(<GalleryGrid items={items} />);
    expect(
      screen.getByRole("img", {
        name: "Students at the bootcamp opening ceremony (Opening day)",
      }),
    ).toBeInTheDocument();
  });

  it("opens the lightbox with the item's intrinsic dimensions", () => {
    render(<GalleryGrid items={items} />);
    fireEvent.click(screen.getAllByRole("button")[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    const overlayImage = screen.getAllByRole("img", {
      name: "Students at the bootcamp opening ceremony (Opening day)",
    })[1];
    expect(overlayImage).toHaveAttribute("width", "1600");
    expect(overlayImage).toHaveAttribute("height", "1200");
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<GalleryGrid items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
