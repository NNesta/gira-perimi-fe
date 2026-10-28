import type { BrowserOptions } from "@sentry/nextjs";

type DataCollection = NonNullable<BrowserOptions["dataCollection"]>;

/**
 * Sentry v11 collects cookies, headers, request bodies and user details by default. None of that is sent: session
 * cookies, e-mail addresses and the unsubscribe tokens in some URLs must never leave the site. Stack traces, page
 * paths and the browser are enough to find a bug.
 */
export const PRIVATE_DATA_COLLECTION: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
};
