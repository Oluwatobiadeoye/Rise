import DOMPurify from "isomorphic-dompurify";

// The exact set of tags TipTap (StarterKit + Link + Image) emits, and nothing
// else. Anything outside the allowlist is stripped rather than escaped.
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

// Only link/image plumbing. `on*`, `style`, `srcset`, `target`, and data-* are
// excluded by virtue of not being listed.
const ALLOWED_ATTR = ["href", "rel", "src", "alt"];

// Permit http/https/mailto and relative URLs only. `javascript:` and `data:`
// fail this pattern (a scheme word followed by `:`), so neither survives on an
// href or an img src.
const ALLOWED_URI_REGEXP =
  /^(?:https?:|mailto:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

// Schemes that may never appear on a src/href, regardless of tag. DOMPurify
// permits `data:` on media tags (e.g. <img>) by default, which would allow an
// SVG/HTML data URI to smuggle script — so we strip these explicitly.
const UNSAFE_SCHEME = /^\s*(?:javascript|data|vbscript|file):/i;

let hookInstalled = false;
function installLinkHook(): void {
  if (hookInstalled) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as Element;
    // Drop any url-bearing attribute with a disallowed scheme.
    for (const attr of ["href", "src"]) {
      const value = el.getAttribute?.(attr);
      if (value && UNSAFE_SCHEME.test(value)) el.removeAttribute(attr);
    }
    // Force safe rel and drop target on every surviving link (tabnabbing).
    if (node.nodeName === "A") {
      el.setAttribute("rel", "noopener noreferrer nofollow");
      el.removeAttribute("target");
    }
  });
  hookInstalled = true;
}

/**
 * Strips authored post HTML down to a known-safe allowlist. Applied on write
 * (before storing) and again on read (before rendering), so stored HTML is
 * never trusted on its own: this defends against mutation-XSS and against a
 * row written under an older, weaker allowlist.
 */
export function sanitizePostHtml(dirty: string): string {
  installLinkHook();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "style",
      "script",
      "svg",
      "iframe",
      "object",
      "embed",
      "form",
      "template",
      "noscript",
    ],
    FORBID_ATTR: ["style", "srcset", "target"],
  });
}
