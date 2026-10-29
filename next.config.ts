import type { NextConfig } from "next";

// FastAPI backend. The browser only ever talks to this Next.js origin: /api and /media are proxied,
// so the httpOnly session cookies stay first-party.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const DEV = process.env.NODE_ENV !== "production";

// Sign in with Google: its script, button frame, styles and calls all live under this address.
const GOOGLE_GSI = "https://accounts.google.com/gsi/";

/** Sentry's ingest host when browser alerts are on (the DSN is public by design: it is in every page). */
function sentryOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").origin;
  } catch {
    return "";
  }
}

// Content Security Policy. Inline scripts stay allowed: pages are prerendered (Partial Prerendering), and the nonces
// that would replace 'unsafe-inline' force every page to render per request (see Next's CSP guide). Even so the
// browser refuses scripts from any other site, plugins, framing, <base> hijacks, forms posting elsewhere, and calls or
// images to unknown hosts, which is where injected code would send what it steals.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE_GSI}client${DEV ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline' ${GOOGLE_GSI}style`,
  // Google profile photos; data:/blob: for generated pictures (shared result card, confetti).
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_GSI} ${sentryOrigin()}${DEV ? " ws:" : ""}`.trim(),
  `frame-src ${GOOGLE_GSI}`,
  // canvas-confetti draws in a worker it creates from a blob.
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...((process.env.SITE_URL ?? "").startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` },
      { source: "/media/:path*", destination: `${API_URL}/media/:path*` },
    ];
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // The offline service worker must always be re-checked, or updates would reach learners days late.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
