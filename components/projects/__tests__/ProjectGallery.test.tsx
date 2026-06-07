import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectGallery } from "../ProjectGallery";
import { getProject, type GallerySchool } from "@/lib/projects";

const img = (path: string) => ({
  src: path,
  height: 1200,
  width: 1600,
  blurDataURL: path,
});

describe("ProjectGallery", () => {
  it("renders a block per school grouped from the roster", () => {
    const schools = getProject("foundations-of-impact")!.gallery!;
    render(<ProjectGallery schools={schools} />);
    expect(
      screen.getByRole("heading", { name: "Aatan Baptist Comprehensive School" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Best Legacy International Secondary School",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "SPED International Secondary School" }),
    ).toBeInTheDocument();
  });

  it("shows a 'being prepared' state for a school without photos", () => {
    const schools: GallerySchool[] = [
      { school: "Pending School", location: "Oyo", photos: [] },
    ];
    render(<ProjectGallery schools={schools} />);
    expect(screen.getByText(/being prepared/i)).toBeInTheDocument();
  });

  it("renders thumbnails once a school has photos", () => {
    const schools: GallerySchool[] = [
      {
        school: "Aatan Baptist Comprehensive School",
        location: "Oyo",
        photos: [
          { src: img("/a1.jpg"), alt: "Students at the 2019 bootcamp" },
          { src: img("/a2.jpg"), alt: "Facilitator leading a session" },
        ],
      },
    ];
    render(<ProjectGallery schools={schools} />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.queryByText(/being prepared/i)).not.toBeInTheDocument();
  });
});
