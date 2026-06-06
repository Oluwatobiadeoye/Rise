/**
 * Site-wide navigation, routes, socials, and contact details.
 *
 * NOTE: email addresses and social URLs are placeholders, to be confirmed
 * before full launch.
 */

export const siteConfig = {
  name: "RISE Initiative",
  shortName: "RISE",
  tagline: "Rising Above Limitations",
  description:
    "Empowering the next generation of leaders. Leadership development, mentorship, and real opportunities for young people.",
  // Temporary; replaced with the real domain at full launch.
  url: "https://rise-initiative.vercel.app",
} as const;

/** Route paths. Some pages are not built yet (they 404 for now). */
export const routes = {
  home: "/",
  about: "/about",
  team: "/team",
  projects: "/projects",
  media: "/blog",
  blog: "/blog",
  gallery: "/gallery",
  getInvolved: "/get-involved",
  mentee: "/get-involved/mentee",
  mentor: "/get-involved/mentor",
  volunteer: "/get-involved#volunteer",
  supportAStudent: "/get-involved#support-a-student",
  contact: "/contact",
  faq: "/faq",
} as const;

/** Primary navigation. */
export const navLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Home", href: routes.home },
  { label: "About", href: routes.about },
  { label: "Team", href: routes.team },
  { label: "Projects", href: routes.projects },
  { label: "Get Involved", href: routes.getInvolved },
  { label: "Contact", href: routes.contact },
];

/** Persistent primary CTA. */
export const primaryCta = {
  label: "Join the Movement",
  href: routes.getInvolved,
} as const;

export type SocialKey = "instagram" | "facebook" | "linkedin";

export const socials: ReadonlyArray<{
  key: SocialKey;
  label: string;
  handle: string;
  href: string;
}> = [
  {
    key: "instagram",
    label: "Instagram",
    handle: "@riseinitiativeoyo",
    href: "https://www.instagram.com/riseinitiativeoyo",
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "RISE Initiative Oyo",
    href: "https://www.facebook.com/riseinitiativeoyo",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    handle: "RISE Initiative",
    href: "https://www.linkedin.com/company/rise-initiative-oyo",
  },
];

/** Contact emails (placeholders). */
export const contactEmails = {
  general: "hello@rise.org",
  partnerships: "partnerships@rise.org",
  mentorship: "mentorship@rise.org",
  media: "media@rise.org",
} as const;
