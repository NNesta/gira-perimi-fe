"use client";

import { useEffect } from "react";

import { setActiveLearner, syncOutbox } from "@/lib/offline";

/** Sends this learner's offline answers now, and again whenever the connection comes back. */
export function useOfflineSync(uid: string) {
  useEffect(() => {
    setActiveLearner(uid);
    const sync = () => void syncOutbox(uid);
    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [uid]);
}
