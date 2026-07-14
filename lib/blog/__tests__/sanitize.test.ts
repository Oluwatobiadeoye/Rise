import { describe, expect, it } from "vitest";
import { sanitizePostHtml } from "../sanitize";

describe("sanitizePostHtml", () => {
  it("strips <script> tags entirely", () => {
    const out = sanitizePostHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).toContain("<p>hi</p>");
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
  });

  it("drops inline event handlers", () => {
    const out = sanitizePostHtml('<p onclick="evil()">x</p><img src="https://e/x.png" onerror="evil()" alt="a">');
    expect(out.toLowerCase()).not.toContain("onclick");
    expect(out.toLowerCase()).not.toContain("onerror");
  });

  it("removes javascript: URLs on links", () => {
    const out = sanitizePostHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("removes data: URLs on images (no SVG/HTML smuggling)", () => {
    const out = sanitizePostHtml(
      '<img src="data:image/svg+xml,<svg onload=alert(1)>" alt="a">',
    );
    expect(out.toLowerCase()).not.toContain("data:");
    expect(out.toLowerCase()).not.toContain("<svg");
  });

  it("strips style and srcset attributes", () => {
    const out = sanitizePostHtml(
      '<p style="position:fixed">x</p><img src="https://e/x.png" srcset="https://e/y.png" alt="a">',
    );
    expect(out.toLowerCase()).not.toContain("style=");
    expect(out.toLowerCase()).not.toContain("srcset");
  });

  it("removes svg, iframe, and object elements", () => {
    const out = sanitizePostHtml(
      '<svg><use href="#x"/></svg><iframe src="https://e"></iframe><object data="x"></object>',
    );
    expect(out.toLowerCase()).not.toContain("<svg");
    expect(out.toLowerCase()).not.toContain("<iframe");
    expect(out.toLowerCase()).not.toContain("<object");
  });

  it("keeps allowed formatting tags", () => {
    const html =
      "<h2>Title</h2><p><strong>bold</strong> <em>it</em></p><ul><li>a</li></ul><blockquote>q</blockquote>";
    const out = sanitizePostHtml(html);
    expect(out).toContain("<h2>");
    expect(out).toContain("<strong>");
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<li>");
  });

  it("forces safe rel on links and keeps http(s) hrefs", () => {
    const out = sanitizePostHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain("noopener");
    expect(out).toContain("noreferrer");
    expect(out).toContain("nofollow");
  });

  it("preserves relative image paths and alt text", () => {
    const out = sanitizePostHtml('<img src="/blog/x/cover.jpg" alt="A cover">');
    expect(out).toContain('src="/blog/x/cover.jpg"');
    expect(out).toContain('alt="A cover"');
  });
});
