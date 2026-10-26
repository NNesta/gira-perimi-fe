import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/cn";

const INTERVALS = ["ejo", "nyuma y’iminsi 3", "nyuma y’icyumweru", "nyuma y’ibyumweru 2", "nyuma y’ukwezi"];
// From "just missed" (sun) to "almost known" (brand): each box is a step closer to mastery.
const TONES = [
  "from-sun-300/40 to-sun-200/10 dark:from-sun-400/25",
  "from-sun-200/40 to-brand-100/20 dark:from-sun-300/15",
  "from-brand-100/60 to-brand-50/20 dark:from-brand-500/15",
  "from-brand-200/60 to-brand-100/20 dark:from-brand-500/25",
  "from-brand-300/60 to-brand-200/20 dark:from-brand-500/35",
];

/** The five Leitner boxes and the mastered pile, with how many items sit in each. */
export function ReviewBoxes({ boxes, mastered }: { boxes: number[]; mastered: number }) {
  return (
    <div>
      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {boxes.map((count, i) => (
          <li
            key={i}
            className={cn("rounded-2xl border border-line bg-gradient-to-b p-3 text-center", TONES[i])}
            title={`Agasanduku ${i + 1}: bigaruka ${INTERVALS[i]}`}
          >
            <span className="block text-[0.65rem] font-bold uppercase tracking-wide text-muted">Agasanduku {i + 1}</span>
            <span className="mt-1 block font-display text-2xl font-extrabold tabular-nums">{count}</span>
            <span className="mt-0.5 block text-[0.7rem] leading-tight text-muted">{INTERVALS[i]}</span>
          </li>
        ))}
        <li className="rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 p-3 text-center text-white shadow-soft">
          <span className="flex items-center justify-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-white/80">
            <GraduationCap className="size-3.5" aria-hidden /> Wabimenye
          </span>
          <span className="mt-1 block font-display text-2xl font-extrabold tabular-nums">{mastered}</span>
          <span className="mt-0.5 block text-[0.7rem] leading-tight text-white/80">ntibigaruka</span>
        </li>
      </ol>
    </div>
  );
}
