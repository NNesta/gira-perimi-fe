"use client";

import { CircleCheck, CloudDownload, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { downloadForOffline, offlineSupported, type OfflineMeta, readOfflineMeta } from "@/lib/offline";

const noop = () => () => {};

/** "Iga nta interineti": saves lessons, signs and the question bank on this device, and offers to install the app. */
export function OfflineCard({ uid, className }: { uid: string; className?: string }) {
  const supported = useSyncExternalStore(noop, offlineSupported, () => false);
  const [meta, setMeta] = useState<OfflineMeta | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState(false);

  useEffect(() => {
    const saved = readOfflineMeta();
    // Reading localStorage after hydration; a copy saved by another learner on this device does not count.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta(saved && saved.uid === uid ? saved : null);
    setAudio(!!(saved && saved.uid === uid && saved.audio));
  }, [uid]);

  if (!supported) return null;

  async function save() {
    setError(null);
    setProgress({ done: 0, total: 1 });
    try {
      setMeta(await downloadForOffline(uid, (done, total) => setProgress({ done, total }), { audio }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setProgress(null);
    }
  }

  const saving = progress !== null;
  return (
    <section className={cn("card relative overflow-hidden p-5 sm:p-7", className)}>
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-ocean-400/15 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ocean-500 to-brand-600 text-white shadow-soft">
          <WifiOff className="size-7" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">Iga nta interineti</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Bika amasomo, ibyapa n’ibibazo byose kuri iki gikoresho (nka MB 5), maze wige n’igihe nta interineti
            ufite. Ibisubizo utanga icyo gihe byoherezwa ugarutse kuri interineti.
          </p>
          <label className="mt-3 flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={audio}
              onChange={(e) => setAudio(e.target.checked)}
              disabled={saving}
              className="mt-0.5 size-4 shrink-0 accent-brand-600"
            />
            <span>
              <span className="font-semibold">Bika n’amajwi y’ibibazo (Umva)</span>{" "}
              <span className="text-muted">— nka MB 43 zindi. Ayo umaze kumva yo arabikwa ubwayo.</span>
            </span>
          </label>
          {meta && !saving && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
              <CircleCheck className="size-4 shrink-0" aria-hidden /> Byabitswe {formatDateTime(meta.savedAt)}
            </p>
          )}
          {saving && (
            <div className="mt-3">
              <ProgressBar value={progress.done} max={progress.total} label="Kubika ku gikoresho" />
              <p className="mt-1.5 text-xs font-semibold text-muted">
                Birabikwa… {progress.done}/{progress.total}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-signal-700 dark:text-signal-300">
              {error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button onClick={save} disabled={saving} variant={meta ? "secondary" : "primary"}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : meta ? (
              <RefreshCw className="size-4" aria-hidden />
            ) : (
              <CloudDownload className="size-4" aria-hidden />
            )}
            {saving ? "Birabikwa…" : meta ? "Vugurura" : "Bika kuri iki gikoresho"}
          </Button>
          {meta && !saving && (
            <Link
              href="/imyitozo/offline"
              className="text-center text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Witoze nta interineti
            </Link>
          )}
          <InstallAppButton />
        </div>
      </div>
    </section>
  );
}
