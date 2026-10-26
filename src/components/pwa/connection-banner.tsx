"use client";

import { CloudUpload, WifiOff } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { pendingCount, subscribeOutbox } from "@/lib/offline";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** A slim bar under the header: offline status, or answers given offline that are waiting to be sent. */
export function ConnectionBanner() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const pending = useSyncExternalStore(subscribeOutbox, () => pendingCount(), () => 0);

  if (online && pending === 0) return null;
  return (
    <div
      role="status"
      className="border-b border-sun-300/60 bg-sun-50 text-sun-900 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200"
    >
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm font-semibold">
        {online ? (
          <>
            <CloudUpload className="size-4 shrink-0" aria-hidden />
            <span>Turimo kohereza ibisubizo {pending} watanze nta interineti…</span>
          </>
        ) : (
          <>
            <WifiOff className="size-4 shrink-0" aria-hidden />
            <span>Nta interineti ufite. Ushobora gukomeza kwiga ibyo wabitse kuri iki gikoresho.</span>
            <Link href="/imyitozo/offline" className="underline underline-offset-4">
              Witoze nta interineti
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
