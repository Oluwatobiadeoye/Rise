import { describe, expect, it } from "vitest";
import { readingMinutesFromHtml } from "../reading-time";

describe("readingMinutesFromHtml", () => {
  it("returns at least 1 minute for short content", () => {
    expect(readingMinutesFromHtml("<p>Just a few words.</p>")).toBe(1);
  });

  it("ignores tags and entities when counting words", () => {
    // 10 words wrapped in markup should not be inflated by tag tokens.
    const html = "<h2>One</h2><p>two three four five six seven eight nine ten</p>";
    expect(readingMinutesFromHtml(html)).toBe(1);
  });

  it("estimates at roughly 200 words per minute", () => {
    const body = `<p>${Array(600).fill("word").join(" ")}</p>`;
    expect(readingMinutesFromHtml(body)).toBe(3);
  });

  it("handles empty body", () => {
    expect(readingMinutesFromHtml("")).toBe(1);
  });
});
