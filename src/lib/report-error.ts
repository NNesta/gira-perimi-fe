/** Sends an error caught by an error page to Sentry (when the site was built with NEXT_PUBLIC_SENTRY_DSN). */
export function reportError(error: unknown) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
}
