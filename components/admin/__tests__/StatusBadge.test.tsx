import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders the human label for each status", () => {
    const cases = [
      ["pending", "Pending"],
      ["in_review", "In review"],
      ["accepted", "Accepted"],
      ["declined", "Declined"],
      ["closed", "Closed"],
      ["archived", "Archived"],
    ] as const;

    for (const [status, label] of cases) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
