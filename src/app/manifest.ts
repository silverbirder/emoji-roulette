import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Emoji Roulette",
    short_name: "Emoji Roulette",
    description: "Spin the wheel of emojis!",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/android-chrome-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/android-chrome-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/android-chrome-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/android-chrome-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
