// Phone notifications (Web Push). The API sends the daily reminder through the browser's push service and
// public/sw.js shows it. iPhones only allow it once the site is installed on the home screen (iOS 16.4+).

import { api } from "@/lib/api";

export type PushStatus = "unsupported" | "needs-install" | "blocked" | "off" | "on";

const READY_TIMEOUT_MS = 4000;

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** The service worker, or null when there is none (development builds, or registration failed). */
async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS));
  return Promise.race([navigator.serviceWorker.ready, timeout]);
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function sameKey(subscription: PushSubscription, publicKey: string): boolean {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const a = new Uint8Array(current);
  const b = keyBytes(publicKey);
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

export async function pushStatus(): Promise<PushStatus> {
  if (isIos() && !isStandalone()) return "needs-install";
  if (!("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  const reg = await registration();
  if (!reg) return "unsupported";
  const subscription = await reg.pushManager.getSubscription();
  return subscription && Notification.permission === "granted" ? "on" : "off";
}

/** Asks for permission, subscribes this browser and tells the API. */
export async function enablePush(publicKey: string): Promise<PushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "blocked" : "off";
  const reg = await registration();
  if (!reg) return "unsupported";
  let subscription = await reg.pushManager.getSubscription();
  if (subscription && !sameKey(subscription, publicKey)) {
    await subscription.unsubscribe(); // the site's key changed: the old subscription can no longer be used
    subscription = null;
  }
  subscription ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
  await api("/push/subscription", { method: "PUT", json: subscription.toJSON() });
  return "on";
}

/** Stops notifications on this browser. The API forgets it too (or does at the next send, when signed out). */
export async function disablePush(): Promise<void> {
  const reg = await registration();
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;
  await api("/push/unsubscribe", { method: "POST", json: { endpoint: subscription.endpoint } }).catch(() => undefined);
  await subscription.unsubscribe();
}

/** Re-sends this browser's subscription: push services can renew it, and someone else may have signed in here. */
export async function syncPush(): Promise<void> {
  const reg = await registration();
  const subscription = await reg?.pushManager.getSubscription();
  if (subscription) await api("/push/subscription", { method: "PUT", json: subscription.toJSON() });
}
