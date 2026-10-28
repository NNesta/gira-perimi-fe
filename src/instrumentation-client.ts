// Browser side of the error alerts. Sentry is downloaded only when NEXT_PUBLIC_SENTRY_DSN was set at build time,
// so learners on slow connections get nothing extra otherwise.

import { PRIVATE_DATA_COLLECTION } from "@/lib/sentry-privacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  void import("@sentry/nextjs").then((Sentry) =>
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      dataCollection: PRIVATE_DATA_COLLECTION,
      tracesSampleRate: 0,
      // Noise that is not ours to fix: extensions, and fetches cut off by a dropped connection (common on mobile).
      ignoreErrors: ["Failed to fetch", "NetworkError", "Load failed", "ResizeObserver loop"],
      denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//],
    }),
  );
}
