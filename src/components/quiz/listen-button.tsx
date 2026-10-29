"use client";

import { LoaderCircle, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { playClip, playingNow, stopClip, subscribePlaying } from "@/lib/audio";

/**
 * "Umva" (listen): reads a question or an explanation aloud, for learners who find reading hard. Renders nothing when
 * there is no clip. Stops when it leaves the screen (the next question).
 */
export function ListenButton({ src, label = "Umva", className }: { src?: string | null; label?: string; className?: string }) {
  const playing = useSyncExternalStore(subscribePlaying, playingNow, () => null) === src;
  const [state, setState] = useState<"idle" | "loading" | "failed">("idle");

  useEffect(
    () => () => {
      if (src && playingNow() === src) stopClip();
    },
    [src],
  );

  if (!src) return null;

  async function toggle() {
    if (playing) {
      stopClip();
      return;
    }
    setState("loading");
    try {
      await playClip(src!);
      setState("idle");
    } catch {
      setState("failed"); // offline and never heard before, or the file is missing
    }
  }

  const Icon = state === "failed" ? VolumeX : playing && state !== "loading" ? Square : Volume2;
  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={playing}
      title={state === "failed" ? "Ijwi ntiryabonetse. Reba interineti yawe." : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 transition",
        playing
          ? "bg-ocean-500 text-white ring-ocean-500"
          : "bg-surface text-ocean-700 ring-ocean-200 hover:bg-ocean-50 dark:text-ocean-300 dark:ring-ocean-400/30 dark:hover:bg-ocean-500/10",
        className,
      )}
    >
      {state === "loading" && playing ? (
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Icon className={cn("size-3.5", playing && "fill-current")} aria-hidden />
      )}
      {playing ? "Hagarika" : label}
    </button>
  );
}
