import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("places the Oyo town vision between the mission and testimonials", () => {
    render(<Home />);

    const mission = screen.getByRole("region", { name: "Our mission" });
    const vision = screen
      .getByRole("heading", {
        name: "Rooted in Oyo town. Growing towards a city in full bloom.",
      })
      .closest("section");
    const testimonials = screen.getByRole("region", {
      name: "Testimonials from previous bootcamps",
    });

    expect(vision).not.toBeNull();
    expect(
      mission.compareDocumentPosition(vision!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      vision!.compareDocumentPosition(testimonials) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
