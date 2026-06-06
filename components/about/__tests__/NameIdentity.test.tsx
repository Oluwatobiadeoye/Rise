import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NameIdentity } from "../NameIdentity";

describe("NameIdentity", () => {
  it("explains the Agboole meaning and the Oyo Project name", () => {
    render(<NameIdentity />);
    expect(screen.getByText(/Agboole/)).toBeInTheDocument();
    expect(screen.getByText(/The Oyo Project \(TOP\)/)).toBeInTheDocument();
    expect(screen.getByText(/the compound, the family home/i)).toBeInTheDocument();
  });

  it("includes a short explainer of what Oyo is", () => {
    render(<NameIdentity />);
    expect(
      screen.getByText(/historic town in southwestern Nigeria/i),
    ).toBeInTheDocument();
  });
});
