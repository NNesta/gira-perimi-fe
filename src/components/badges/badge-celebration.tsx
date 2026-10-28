"use client";

import confetti from "canvas-confetti";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { BadgeMedal } from "@/components/badges/badge-medal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Badge } from "@/lib/types";

const storageKey = (uid: string) => `gp-badges-${uid}`;

function seenBadges(uid: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey(uid)) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/**
 * Shows the badges earned since this browser last saw them, with a burst of confetti. The list of seen badges is a
 * per-browser convenience: on another phone the same badges are simply celebrated once more.
 */
export function BadgeCelebration({ uid, badges, delayMs = 600 }: { uid: string; badges: Badge[]; delayMs?: number }) {
  const [fresh, setFresh] = useState<Badge[]>([]);

  useEffect(() => {
    const seen = seenBadges(uid);
    const earned = badges.filter((b) => b.earned);
    const unseen = earned.filter((b) => !seen.has(b.id));
    if (!unseen.length) return;
    try {
      localStorage.setItem(storageKey(uid), JSON.stringify(earned.map((b) => b.id)));
    } catch {
      // storage blocked: the celebration may simply repeat next time
    }
    const timer = setTimeout(() => {
      setFresh(unseen);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void confetti({ particleCount: 90, spread: 75, origin: { y: 0.45 }, colors: ["#129b68", "#fad201", "#00a1de", "#ffffff"] });
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [uid, badges, delayMs]);

  const many = fresh.length > 1;
  return (
    <Dialog
      open={fresh.length > 0}
      onClose={() => setFresh([])}
      title={many ? `Wabonye ibihembo ${fresh.length} bishya!` : "Wabonye igihembo gishya!"}
      description="Komereza aho: buri gihembo kikwereka ko wegera perimi yawe."
      size="sm"
    >
      <ul className="mt-2 space-y-3">
        {fresh.map((badge) => (
          <li key={badge.id} className="flex items-center gap-4 rounded-2xl bg-surface-2 p-3">
            <BadgeMedal badge={badge} size={56} />
            <span>
              <span className="block font-bold">{badge.title}</span>
              <span className="block text-sm text-muted">{badge.description}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => setFresh([])}>
          Komeza
        </Button>
        <ButtonLink href="/ibihembo" onClick={() => setFresh([])}>
          Reba ibihembo byose <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    </Dialog>
  );
}
