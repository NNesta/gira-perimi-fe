import type { Metadata } from "next";

/** Public address of the website, without a trailing slash (server-side: SITE_URL is not sent to browsers). */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Link-preview tags (WhatsApp, Facebook, X) for one page. A page's `openGraph` replaces the root layout's whole
 * object, so the shared fields are repeated here. Without `image`, the picture is app/opengraph-image.tsx.
 */
export function pageShare(
  title: string,
  description: string,
  image?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;
  return {
    openGraph: { type: "website", locale: "rw_RW", siteName: "Tsinda Neza", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
