import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Lightbox } from "../Lightbox";

const img = (path: string) => ({
  src: path,
  height: 1200,
  width: 1600,
  blurDataURL: path,
});

const photos = [
  { src: img("/a1.jpg"), alt: "First photo" },
  { src: img("/a2.jpg"), alt: "Second photo" },
];

describe("Lightbox", () => {
  it("opens the overlay when a thumbnail is clicked", () => {
    render(<Lightbox photos={photos} label="Photographs" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("advances to the next photo", () => {
    render(<Lightbox photos={photos} label="Photographs" />);
    fireEvent.click(screen.getAllByRole("button")[0]);

    fireEvent.click(screen.getByRole("button", { name: /next image/i }));
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("2 of 2"),
    );
  });

  it("closes on Escape", () => {
    render(<Lightbox photos={photos} label="Photographs" />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on the close button", () => {
    render(<Lightbox photos={photos} label="Photographs" />);
    fireEvent.click(screen.getAllByRole("button")[0]);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
