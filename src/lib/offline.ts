// Offline study. "Bika kuri iki gikoresho" saves the question bank (answers and explanations included), the lesson and
// practice pages, their scripts and every image into Cache Storage; the service worker (public/sw.js) serves them when
// there is no connection. Answers given offline wait in an outbox (localStorage) tagged with the learner's id, and sync
// as soon as that learner is online again, so a shared phone never mixes two learners' answers.

import { api, ApiError } from "@/lib/api";
import type { LessonSummary, OfflinePack, QuestionWithAnswer, Sign } from "@/lib/types";

// Cache names: keep in sync with public/sw.js.
export const PAGES_CACHE = "gp-pages-v1";
export const STATIC_CACHE = "gp-static-v1";
export const MEDIA_CACHE = "gp-media-v1";
export const PACK_CACHE = "gp-pack-v1";

const PACK_URL = "/api/v1/offline/pack";
const META_KEY = "gp-offline";
const OUTBOX_KEY = "gp-outbox";
// The learner signed in on this device (set by the header); the connection banner counts only their answers.
const LEARNER_KEY = "gp-learner";
const OUTBOX_EVENT = "gp-outboxchange";
const OUTBOX_LIMIT = 2000;
const SYNC_BATCH = 500;
const DOWNLOAD_CONCURRENCY = 6;

export type OfflineMeta = { uid: string; version: string; savedAt: string; files: number };

export type PendingAnswer = {
  client_id: string;
  uid: string;
  question_id: number;
  selected: number;
  answered_at: string;
};

export function offlineSupported(): boolean {
  return typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: offline extras simply stay unavailable
  }
}

// ------------------------------------------------------------------ saved copy
export function readOfflineMeta(): OfflineMeta | null {
  return readJSON<OfflineMeta | null>(META_KEY, null);
}

export async function loadPack(): Promise<OfflinePack | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await caches.open(PACK_CACHE);
    const response = await cache.match(PACK_URL);
    return response ? ((await response.json()) as OfflinePack) : null;
  } catch {
    return null;
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A random practice set from the saved copy ("new"/"mistakes" need the server's history, so offline is random). */
export function localPracticeSet(pack: OfflinePack, topic: string | null, count: number): QuestionWithAnswer[] {
  const pool = topic ? pack.questions.filter((q) => q.topic === topic) : pack.questions;
  return shuffle(pool).slice(0, count);
}

/** Static assets a page needs (scripts, styles, fonts), read from its HTML. */
function assetsIn(html: string): string[] {
  return [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
}

async function pool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0;
  const run = async () => {
    while (next < items.length) await worker(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, items.length) }, run));
}

/**
 * Saves everything needed to study offline. Reports progress as (done, total) files. Throws on a network error or
 * when the session has expired (ApiError 401).
 */
export async function downloadForOffline(uid: string, onProgress: (done: number, total: number) => void) {
  const [packResponse, lessons, signs] = await Promise.all([
    fetch(PACK_URL, { credentials: "same-origin" }),
    api<LessonSummary[]>("/lessons"),
    api<{ signs: Sign[] }>("/signs"),
  ]);
  if (!packResponse.ok) throw new ApiError(packResponse.status, "Ntitwashoboye kubika imyitozo. Ongera ugerageze.");
  const pack = (await packResponse.clone().json()) as OfflinePack;

  const pages = [
    "/",
    "/amasomo",
    ...lessons.filter((l) => !l.locked).map((l) => `/amasomo/${l.slug}`),
    "/ibyapa",
    "/imyitozo",
    "/imyitozo/offline",
    "/ikibaho",
    "/nta-interineti",
  ];
  const images = new Set<string>(signs.signs.map((s) => s.image));
  for (const q of pack.questions) {
    if (q.image) images.add(q.image);
    for (const o of q.options) if (o.image) images.add(o.image);
  }

  const [pageCache, staticCache, mediaCache, packCache] = await Promise.all([
    caches.open(PAGES_CACHE),
    caches.open(STATIC_CACHE),
    caches.open(MEDIA_CACHE),
    caches.open(PACK_CACHE),
  ]);
  await packCache.put(PACK_URL, packResponse);

  let done = 0;
  let total = pages.length + images.size;
  onProgress(done, total);
  const tick = () => onProgress(++done, total);

  const assets = new Set<string>();
  await pool(pages, async (url) => {
    const response = await fetch(url, { credentials: "same-origin" });
    if (response.ok) {
      const html = await response.clone().text();
      for (const asset of assetsIn(html)) assets.add(asset);
      await pageCache.put(url, response);
    }
    tick();
  });

  const missingAssets: string[] = [];
  for (const asset of assets) if (!(await staticCache.match(asset))) missingAssets.push(asset);
  total += missingAssets.length;
  await pool([...images, ...missingAssets], async (url) => {
    const cache = url.startsWith("/media/") ? mediaCache : staticCache;
    if (!(await cache.match(url))) {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    }
    tick();
  });

  const meta: OfflineMeta = { uid, version: pack.version, savedAt: new Date().toISOString(), files: total };
  writeJSON(META_KEY, meta);
  return meta;
}

/** On sign-out: drops copies that hold the learner's pages and the saved bank. Scripts and images are not personal. */
export async function clearPersonalCaches() {
  try {
    localStorage.removeItem(META_KEY);
    localStorage.removeItem(LEARNER_KEY);
    window.dispatchEvent(new Event(OUTBOX_EVENT));
  } catch {
    // nothing stored
  }
  if (typeof window === "undefined" || !("caches" in window)) return;
  await Promise.all([caches.delete(PAGES_CACHE), caches.delete(PACK_CACHE)]).catch(() => undefined);
}

// ------------------------------------------------------------------ outbox
function readOutbox(): PendingAnswer[] {
  return readJSON<PendingAnswer[]>(OUTBOX_KEY, []);
}

function writeOutbox(items: PendingAnswer[]) {
  writeJSON(OUTBOX_KEY, items.slice(-OUTBOX_LIMIT));
  window.dispatchEvent(new Event(OUTBOX_EVENT));
}

export function queueAnswer(uid: string, questionId: number, selected: number) {
  writeOutbox([
    ...readOutbox(),
    {
      client_id: crypto.randomUUID(),
      uid,
      question_id: questionId,
      selected,
      answered_at: new Date().toISOString(),
    },
  ]);
}

export function setActiveLearner(uid: string) {
  try {
    if (localStorage.getItem(LEARNER_KEY) === uid) return;
    localStorage.setItem(LEARNER_KEY, uid);
    window.dispatchEvent(new Event(OUTBOX_EVENT));
  } catch {
    // storage blocked: the banner just shows nothing pending
  }
}

/** Answers waiting to be sent for the learner signed in on this device. */
export function pendingCount(): number {
  let uid: string | null = null;
  try {
    uid = localStorage.getItem(LEARNER_KEY);
  } catch {
    return 0;
  }
  return uid ? readOutbox().filter((a) => a.uid === uid).length : 0;
}

export function subscribeOutbox(onChange: () => void) {
  const onStorage = (event: StorageEvent) => event.key === OUTBOX_KEY && onChange();
  window.addEventListener(OUTBOX_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(OUTBOX_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

let syncing = false;

/** Sends this learner's offline answers. Returns how many were sent; keeps them if the network is still down. */
export async function syncOutbox(uid: string): Promise<number> {
  if (syncing || typeof navigator === "undefined" || !navigator.onLine) return 0;
  const mine = readOutbox().filter((a) => a.uid === uid);
  if (mine.length === 0) return 0;
  syncing = true;
  let sent = 0;
  try {
    for (let i = 0; i < mine.length; i += SYNC_BATCH) {
      const batch = mine.slice(i, i + SYNC_BATCH);
      await api("/practice/answers/offline", {
        method: "POST",
        json: {
          answers: batch.map((a) => ({
            client_id: a.client_id,
            question_id: a.question_id,
            selected: a.selected,
            answered_at: a.answered_at,
          })),
        },
      });
      const done = new Set(batch.map((a) => a.client_id));
      writeOutbox(readOutbox().filter((a) => !done.has(a.client_id)));
      sent += batch.length;
    }
  } catch {
    // offline again or signed out: the rest waits for the next attempt
  } finally {
    syncing = false;
  }
  return sent;
}
