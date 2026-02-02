import { MetadataRoute } from "next"
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "acbuy-spreadsheet best rep spreadsheet",
    short_name: "acbuy-spreadsheet",
    description: "Discover rep spreadsheet with the best rep finds.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#F97084",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}