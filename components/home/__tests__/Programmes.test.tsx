import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Programmes } from "../Programmes";

describe("Programmes", () => {
  it("renders the section heading and tagline", () => {
    render(<Programmes />);
    expect(
      screen.getByRole("heading", { name: "Our programmes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Three pathways. One mission. Limitless impact."),
    ).toBeInTheDocument();
  });

  it("renders the three named programmes", () => {
    render(<Programmes />);
    expect(
      screen.getByRole("heading", { name: "RISE Foundations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "RISE Horizons" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "RISE Impact Network" }),
    ).toBeInTheDocument();
  });

  it("deep-links each programme to its tier on the TOP page", () => {
    render(<Programmes />);
    const links = screen.getAllByRole("link", { name: /Explore RISE/i });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/projects/the-oyo-project#rise-foundations",
      "/projects/the-oyo-project#rise-horizons",
      "/projects/the-oyo-project#rise-impact-network",
    ]);
  });
});
