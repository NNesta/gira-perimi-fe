/** Only same-site relative paths are allowed as post-login destinations (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/ikibaho"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/** Where a learner goes once signed in (Google or email link): new learners get the short welcome first. */
export function afterSignIn(user: { onboarded: boolean }, next: string | null | undefined): string {
  const destination = safeNext(next);
  return user.onboarded ? destination : `/ikaze?next=${encodeURIComponent(destination)}`;
}

/**
 * Leaves a session (sign-out, account deletion) with a full page load instead of a client-side navigation. The client
 * router keeps previous pages alive in memory for back/forward, so on a shared computer the next person could press
 * Back and see the account that just signed out. Pages saved for offline use and phone notifications are dropped for
 * the same reason.
 */
export async function leaveSession(to = "/") {
  const [{ clearPersonalCaches }, { disablePush }] = await Promise.all([import("@/lib/offline"), import("@/lib/push")]);
  // A phone is often shared: the next person must not get this learner's reminders.
  await Promise.all([clearPersonalCaches(), disablePush().catch(() => undefined)]);
  window.location.replace(to);
}
