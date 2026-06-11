import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { siteConfig } from "@/lib/site";

// Display / headings. Variable font — full weight axis (400–800) self-hosted
// by next/font at build (no user-facing Google request). latin-ext for Yoruba.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Body / UI. Plus Jakarta Sans fully covers Yoruba tone marks (ẹ ọ ṣ + marks),
// so tone-marked Yoruba lives in body text, not Sora headings.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "RISE Initiative: Empowering the next generation of leaders",
    template: "%s · RISE Initiative",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "RISE Initiative: Empowering the next generation of leaders",
    description: siteConfig.description,
    locale: "en_NG",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "RISE Initiative",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteChrome>{children}</SiteChrome>
        {/* Cookieless, privacy friendly analytics: no consent banner needed. */}
        <Analytics />
      </body>
    </html>
  );
}
