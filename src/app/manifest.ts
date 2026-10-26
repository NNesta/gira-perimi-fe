import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Gira Perimi · Amategeko y’umuhanda",
    short_name: "Gira Perimi",
    description:
      "Iga amategeko y’umuhanda mu Kinyarwanda, witoze ibibazo by’ikizamini cy’uruhushya rw’agateganyo, n’igihe nta interineti ufite.",
    lang: "rw",
    dir: "ltr",
    start_url: "/ikibaho",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f7fb",
    theme_color: "#129b68",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Imyitozo", url: "/imyitozo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Isubiramo", url: "/isubiramo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Ikizamini", url: "/ikizamini", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
