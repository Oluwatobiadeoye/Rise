// Ambient types for static image imports (e.g. `import x from "@/public/a.jpg"`).
// Mirrors the reference Next.js writes into the git-ignored next-env.d.ts, so
// `tsc` can type-check image imports in CI without depending on a build first.
/// <reference types="next/image-types/global" />
