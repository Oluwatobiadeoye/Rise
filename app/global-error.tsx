"use client";

import { useEffect } from "react";

// global-error replaces the root layout (and its globals.css/Tailwind), so this
// boundary is intentionally self-contained with inline brand styling.
const EVERGREEN = "#0f5b4f";
const INK = "#1f2933";
const SLATE = "#586471";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: INK,
          backgroundColor: "#fff",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: EVERGREEN,
          }}
        >
          RISE Initiative
        </p>
        <h1 style={{ margin: "0.75rem 0 0", fontSize: "1.75rem" }}>
          Something went wrong.
        </h1>
        <p
          style={{
            margin: "1rem 0 0",
            maxWidth: "28rem",
            lineHeight: 1.6,
            color: SLATE,
          }}
        >
          We hit an unexpected problem. Please try again, and if it keeps
          happening, check back shortly.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.85rem 1.75rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: EVERGREEN,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
