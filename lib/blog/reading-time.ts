/**
 * Whole-minute reading estimate at 200 words per minute (minimum 1), computed
 * from an HTML body's text content. Tags and entities are stripped first so
 * markup tokens do not inflate the count.
 */
export function readingMinutesFromHtml(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
