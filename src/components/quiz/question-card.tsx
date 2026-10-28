/* eslint-disable @next/next/no-img-element -- question scans are pre-optimised WebP served by the API */
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

import { Explanation } from "@/components/quiz/explanation";
import { cn } from "@/lib/cn";
import { highlight } from "@/lib/highlight";
import type { QuestionWithAnswer } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];

/**
 * A question with all of its options, the right one marked, and its explanation: for browsing (search, mistakes).
 * `picked` marks the learner's wrong choice; `words` highlights search matches.
 */
export function QuestionCard({
  question,
  topicName,
  picked,
  words = [],
  badges,
  meta,
}: {
  question: QuestionWithAnswer;
  topicName?: string;
  picked?: number | null;
  words?: string[];
  badges?: ReactNode;
  meta?: ReactNode;
}) {
  const imageOptions = question.options.some((o) => o.image);
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-asphalt px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-asphalt">
          Ikibazo {question.ref}
        </span>
        {topicName && <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft">{topicName}</span>}
        {badges}
        {meta && <span className="ml-auto text-xs font-semibold text-muted">{meta}</span>}
      </div>

      <div className="mt-4 flex gap-4">
        {question.image && (
          <span className="paper grid size-24 shrink-0 place-items-center p-1.5 sm:size-28">
            <img src={question.image} alt="Ishusho y’ikibazo" className="max-h-full max-w-full object-contain" loading="lazy" />
          </span>
        )}
        <p className="min-w-0 flex-1 font-semibold leading-snug sm:text-lg">{highlight(question.text, words)}</p>
      </div>

      <ul className={cn("mt-4 grid gap-2", imageOptions && "grid-cols-2 sm:grid-cols-4")}>
        {question.options.map((option, i) => {
          const right = i === question.answer;
          const wrong = i === picked && !right;
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm",
                imageOptions && "flex-col items-center",
                right && "bg-brand-50 text-brand-900 ring-1 ring-brand-200 dark:bg-brand-500/12 dark:text-brand-100 dark:ring-brand-400/25",
                wrong && "bg-signal-50 text-signal-900 ring-1 ring-signal-200 dark:bg-signal-500/12 dark:text-signal-100 dark:ring-signal-400/25",
                !right && !wrong && "text-muted",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-lg text-xs font-extrabold uppercase",
                  right ? "bg-brand-500 text-white" : wrong ? "bg-signal-500 text-white" : "bg-surface-2",
                )}
              >
                {right ? <Check className="size-3.5" aria-label="Igisubizo cy’ukuri" /> : wrong ? <X className="size-3.5" aria-label="Wahisemo" /> : LETTERS[i]}
              </span>
              {option.image && (
                <img src={option.image} alt={`Igisubizo ${LETTERS[i]}`} className="h-20 w-auto object-contain" loading="lazy" />
              )}
              {option.text && <span className="leading-snug">{highlight(option.text, words)}</span>}
              {wrong && <span className="sr-only">(wahisemo iki)</span>}
            </li>
          );
        })}
      </ul>

      <Explanation text={question.explanation} lawRef={question.law_ref} compact className="mt-4" />
    </article>
  );
}
