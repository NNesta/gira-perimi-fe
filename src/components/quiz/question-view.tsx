"use client";
/* eslint-disable @next/next/no-img-element -- question scans are pre-optimised WebP served by the API */

import { Check, X } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import type { Option } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "missed" | "dimmed";

/**
 * idle/selected while answering; after feedback the right answer is "correct",
 * a wrong pick is "wrong", the right answer the learner did not pick is "missed".
 */
export function optionStates(count: number, selected: number | null, answer: number | null | undefined): OptionState[] {
  return Array.from({ length: count }, (_, i) => {
    if (answer === null || answer === undefined) return i === selected ? "selected" : "idle";
    if (i === answer) return selected === answer ? "correct" : "missed";
    if (i === selected) return "wrong";
    return "dimmed";
  });
}

const STATE_STYLES: Record<OptionState, string> = {
  idle: "border-line bg-surface hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft",
  selected:
    "border-brand-500 bg-brand-50 shadow-[0_0_0_4px_rgb(18_155_104/0.15)] dark:bg-brand-500/15 dark:shadow-[0_0_0_4px_rgb(18_155_104/0.25)]",
  correct: "border-brand-500 bg-brand-50 dark:bg-brand-500/15",
  missed: "border-brand-400 border-dashed bg-brand-50/60 dark:bg-brand-500/10",
  wrong: "border-signal-400 bg-signal-50 dark:bg-signal-500/12",
  dimmed: "border-line bg-surface opacity-60",
};

const LETTER_STYLES: Record<OptionState, string> = {
  idle: "bg-surface-2 text-ink-soft",
  selected: "bg-brand-500 text-white",
  correct: "bg-brand-500 text-white",
  missed: "bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200",
  wrong: "bg-signal-500 text-white",
  dimmed: "bg-surface-2 text-muted",
};

function StateIcon({ state }: { state: OptionState }) {
  if (state === "correct" || state === "missed") return <Check className="size-5 text-brand-600" aria-label="Igisubizo cy’ukuri" />;
  if (state === "wrong") return <X className="size-5 text-signal-600" aria-label="Igisubizo kitari cyo" />;
  return null;
}

export function QuestionView({
  number,
  total,
  text,
  image,
  options,
  states,
  onSelect,
  disabled = false,
  topicLabel,
}: {
  number?: number;
  total?: number;
  text: string;
  image: string | null;
  options: Option[];
  states: OptionState[];
  onSelect?: (index: number) => void;
  disabled?: boolean;
  topicLabel?: string;
}) {
  const imageOptions = options.some((o) => o.image);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
        {number !== undefined && (
          <span className="rounded-full bg-asphalt px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-asphalt">
            Ikibazo {number}
            {total ? ` / ${total}` : ""}
          </span>
        )}
        {topicLabel && <span className="rounded-full bg-surface-2 px-3 py-1 text-xs">{topicLabel}</span>}
      </div>

      <h2 className="mt-4 font-sans text-xl font-bold leading-snug tracking-normal sm:text-[1.6rem]">{text}</h2>

      {image && (
        <div className="paper mt-5 flex justify-center border border-line p-3 shadow-soft">
          <img src={image} alt="Ishusho y’ikibazo" className="max-h-64 w-auto object-contain sm:max-h-80" loading="lazy" />
        </div>
      )}

      <div className={cn("mt-6 grid gap-3", imageOptions && "grid-cols-2")} role="radiogroup" aria-label="Ibisubizo">
        {options.map((option, i) => {
          const state = states[i] ?? "idle";
          return (
            <motion.button
              key={i}
              type="button"
              role="radio"
              aria-checked={state === "selected" || state === "correct" || state === "wrong"}
              disabled={disabled}
              onClick={() => onSelect?.(i)}
              whileTap={disabled ? undefined : { scale: 0.985 }}
              className={cn(
                "group relative flex w-full items-center gap-4 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 sm:p-4",
                imageOptions && "flex-col items-stretch gap-2",
                disabled ? "cursor-default" : "cursor-pointer",
                STATE_STYLES[state],
              )}
            >
              <span className={cn("flex items-center gap-3", imageOptions && "justify-between")}>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold uppercase transition-colors",
                    LETTER_STYLES[state],
                  )}
                >
                  {LETTERS[i]}
                </span>
                {imageOptions && <StateIcon state={state} />}
              </span>
              {option.image ? (
                <span className="paper grid place-items-center p-2">
                  <img src={option.image} alt={`Igisubizo ${LETTERS[i]}`} className="h-28 w-auto object-contain" loading="lazy" />
                </span>
              ) : null}
              {option.text && (
                <span className="flex-1 text-[0.98rem] font-medium leading-snug text-ink sm:text-base">{option.text}</span>
              )}
              {!imageOptions && <StateIcon state={state} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
