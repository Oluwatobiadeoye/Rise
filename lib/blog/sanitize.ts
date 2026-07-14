import sanitizeHtml from "sanitize-html";

// The exact set of tags TipTap (StarterKit + Link + Image) emits, and nothing
// else. Anything outside the allowlist is discarded rather than escaped.
const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "code",
  "pre",
  "br",
  "hr",
];

/**
 * Strips authored post HTML down to a known-safe allowlist using sanitize-html
 * (pure JS, no DOM/jsdom — safe in the serverless runtime). Applied on write
 * (before storing) and again on read (before rendering), so stored HTML is
 * never trusted on its own.
 *
 * Hardening: only http/https/mailto schemes (no `javascript:`/`data:`), images
 * limited to http/https (no `data:` SVG smuggling), no `style`/`srcset`/`target`
 * attributes (they are simply not in the allowlist), and every surviving link
 * is forced to rel="noopener noreferrer nofollow".
 */
export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...(attribs.href ? { href: attribs.href } : {}),
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });
}
