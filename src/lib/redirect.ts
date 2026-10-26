/** Only same-site relative paths are allowed as post-login destinations (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/ikibaho"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/**
 * Leaves a session (sign-out, account deletion) with a full page load instead of a client-side navigation. The client
 * router keeps previous pages alive in memory for back/forward, so on a shared computer the next person could press
 * Back and see the account that just signed out.
 */
export function leaveSession(to = "/") {
  window.location.replace(to);
}
