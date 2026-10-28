// Error alerts with Sentry (free plan), off unless SENTRY_DSN is set. This side reports errors raised while the
// server renders a page; src/instrumentation-client.ts reports the browser's.

import type { Instrumentation } from "next";

import { PRIVATE_DATA_COLLECTION } from "@/lib/sentry-privacy";

export async function register() {
  if (!process.env.SENTRY_DSN || process.env.NEXT_RUNTIME !== "nodejs") return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    dataCollection: PRIVATE_DATA_COLLECTION,
    tracesSampleRate: 0, // errors only: stays inside the free plan
  });
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!process.env.SENTRY_DSN || process.env.NEXT_RUNTIME !== "nodejs") return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
