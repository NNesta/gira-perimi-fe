// "Soma icyapa!": a sign comes towards the car and the learner names it before the car reaches it. The rules of the
// game, kept apart from the drawing: timing, scoring, the deck of signs and the wrong answers offered.

import type { Sign } from "@/lib/types";

export const LIVES = 3;
export const OPTION_COUNT = 4;
/** A sign named wrongly comes back this many rounds later, while its meaning is still fresh. */
export const RETRY_AFTER = 5;

/** Seconds a sign takes to reach the car: generous at first, a little less every round, never under 4. */
export function roundSeconds(round: number): number {
  return Math.max(4, 9 - 0.3 * round);
}

/** Points multiplier for a run of right answers in a row: ×2 from 3, ×3 from 6, ×4 from 10. */
export function multiplier(combo: number): number {
  return combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
}

/** Points for a right answer: 50 for being right, up to 100 more for answering early, times the multiplier. */
export function points(remaining: number, combo: number): number {
  return Math.round(50 + 100 * Math.min(1, Math.max(0, remaining))) * multiplier(combo);
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * The four meanings offered for `sign`. Early on the wrong ones come from anywhere; from round 5 one is a look-alike
 * from the sign's own category, from round 12 all three are. Several signs share a name (five are "Inkomane ku muhanda
 * utambukwamo mbere"), so the four names are always different.
 */
export function options(sign: Sign, all: Sign[], round: number, random = Math.random): Sign[] {
  const lookAlikes = round >= 12 ? OPTION_COUNT - 1 : round >= 5 ? 1 : 0;
  const names = new Set([sign.name]);
  const wrong: Sign[] = [];
  const take = (pool: Sign[], upTo: number) => {
    for (const candidate of shuffle(pool, random)) {
      if (wrong.length >= upTo) return;
      if (names.has(candidate.name)) continue;
      names.add(candidate.name);
      wrong.push(candidate);
    }
  };
  take(
    all.filter((s) => s.category === sign.category),
    lookAlikes,
  );
  take(all, OPTION_COUNT - 1);
  return shuffle([sign, ...wrong], random);
}

/** Puts a missed sign back into the deck a few rounds ahead. */
export function retryLater(deck: Sign[], round: number, sign: Sign): Sign[] {
  const at = Math.min(deck.length, round + RETRY_AFTER);
  return [...deck.slice(0, at), sign, ...deck.slice(at)];
}

// The best score is a per-device convenience: on another phone the learner simply sets a new one.
const BEST_KEY = "gp-soma-icyapa-best";

export function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // storage blocked: the record is only kept for this visit
  }
}
