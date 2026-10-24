import { ImageResponse } from "next/og";
import { siteConfig } from "@/shared/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1f2937 100%)",
          color: "#fff",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 32, opacity: 0.7, marginTop: 24 }}>{siteConfig.description}</div>
      </div>
    ),
    size,
  );
}
