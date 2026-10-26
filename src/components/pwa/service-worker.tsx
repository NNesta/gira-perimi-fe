"use client";

import { useEffect } from "react";

/** Registers the offline service worker in production. In development it removes any worker left by a build. */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((list) => list.forEach((r) => void r.unregister()));
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);
  return null;
}
