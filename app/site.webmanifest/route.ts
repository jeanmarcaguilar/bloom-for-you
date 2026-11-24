import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Bloom for You",
      short_name: "Bloom",
      description: "Send and view personalized digital flower bouquets",
      start_url: "/",
      display: "standalone",
      background_color: "#F0FDFA",
      theme_color: "#06B6D4",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    {
      headers: { "Content-Type": "application/manifest+json" },
    }
  );
}
