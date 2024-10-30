import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Emoji Roulette";
const description = "Spin the wheel of emojis!";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #ff6b6b, #4ecdc4)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "white",
            marginBottom: 24,
          }}
        >
          Emoji Roulette
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255, 255, 255, 0.9)",
            marginBottom: 40,
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 100,
          }}
        >
          {"🎰🎭🎲🍀"}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
