import type { NextConfig } from "next";

// The Supabase project origin that serves public blog images. Derived from the
// configured URL at build time, with the known project host as a fallback.
// `||` (not `??`) so an empty-string env var — as can happen during CI builds —
// also falls back rather than producing `new URL("")`.
const DEFAULT_SUPABASE_ORIGIN = "https://wzzlsexsvohrptvekcqz.supabase.co";
function resolveSupabaseOrigin(): string {
  try {
    return new URL(process.env.SUPABASE_URL || DEFAULT_SUPABASE_ORIGIN).origin;
  } catch {
    return DEFAULT_SUPABASE_ORIGIN;
  }
}
const supabaseOrigin = resolveSupabaseOrigin();

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Blog post bodies are admin-authored and sanitized to
// an allowlist (no script/style/svg), so the high-value directives here are the
// origin restrictions on images/connections and the frame/base/object locks.
// `unsafe-inline` is required for Next's inline bootstrap and injected styles;
// a nonce-based tightening is a possible follow-on. Dev adds eval + websockets
// for hot-module reloading.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  `font-src 'self'`,
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws:" : ""}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join("; ");

// Baseline security headers (clickjacking, MIME-sniffing, referrer leakage,
// HTTPS enforcement) plus the CSP above.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Image uploads run through a Server Action; the default 1 MB body cap is
  // below our 8 MB image limit. Allow headroom for multipart overhead (the
  // storage adapter still enforces the real 8 MB image cap).
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(supabaseOrigin).hostname,
        pathname: "/storage/v1/object/public/blog/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
