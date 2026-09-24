import { ImageResponse } from "next/og";

export const alt = "Esprit Rénov' — Rénovation intérieure et extérieure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px",
          background: "#0B0B0F",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 180,
            height: 8,
            background: "linear-gradient(90deg, #EC3F9C, #8B3DF5, #5B4BFF)",
            marginBottom: 28,
          }}
        />
        <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -3 }}>ESPRIT RÉNOV&apos;</div>
        <div style={{ fontSize: 36, marginTop: 16 }}>Rénovation intérieure & extérieure</div>
      </div>
    ),
    { ...size },
  );
}
