import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt =
  "RISE Initiative: Empowering the next generation of leaders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const evergreen = "#0f5b4f";
const evergreen700 = "#093931";
const gold = "#c9a86a";
const paper = "#f7f5f0";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundImage: `linear-gradient(135deg, ${evergreen700} 0%, ${evergreen} 70%)`,
          color: paper,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: 480,
            backgroundImage: `radial-gradient(circle, ${gold}33 0%, ${gold}00 70%)`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: gold,
              color: evergreen700,
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Empowering the next generation of leaders.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: gold,
              fontWeight: 600,
            }}
          >
            Rising above limitations
          </div>
        </div>
      </div>
    ),
    size,
  );
}
