import { Crown, Trophy } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ChallengePlayer } from "@/lib/types";

/** Everyone who sat the same paper, best first. */
export function ChallengeStandings({ players, passMark = 12 }: { players: ChallengePlayer[]; passMark?: number }) {
  return (
    <ol className="divide-y divide-line">
      {players.map((player, i) => (
        <li
          key={`${player.name}-${i}`}
          className={cn("flex items-center gap-4 py-3", player.you && "-mx-3 rounded-2xl bg-brand-50 px-3 dark:bg-brand-500/10")}
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold",
              i === 0 ? "bg-sun-300 text-asphalt" : "bg-surface-2 text-ink-soft",
            )}
          >
            {i === 0 ? <Trophy className="size-4" aria-label="Uwa mbere" /> : i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">
              {player.name}
              {player.you && <span className="ml-2 text-xs font-bold text-brand-600 dark:text-brand-300">Wowe</span>}
            </span>
            {player.creator && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
                <Crown className="size-3.5" aria-hidden /> Yatanze umukino
              </span>
            )}
          </span>
          <span
            className={cn(
              "font-display text-xl font-extrabold tabular-nums",
              player.score >= passMark ? "text-brand-600 dark:text-brand-300" : "text-signal-600 dark:text-signal-400",
            )}
          >
            {player.score}
            <span className="text-sm font-semibold text-muted">/{player.total}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
