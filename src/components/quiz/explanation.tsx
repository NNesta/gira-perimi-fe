import { Lightbulb, Scale } from "lucide-react";

import { ListenButton } from "@/components/quiz/listen-button";
import { cn } from "@/lib/cn";

/** "Impamvu": why the right answer is right, with the article of law it rests on. Renders nothing without text. */
export function Explanation({
  text,
  lawRef,
  audio,
  compact = false,
  className,
}: {
  text: string | null | undefined;
  lawRef?: string | null;
  /** The explanation read aloud ("Umva"). */
  audio?: string | null;
  /** Smaller variant for lists (exam review, practice summary). */
  compact?: boolean;
  className?: string;
}) {
  if (!text) return null;
  return (
    <div
      className={cn(
        "rounded-2xl border border-ocean-200/80 bg-ocean-50/70 dark:border-ocean-400/20 dark:bg-ocean-500/10",
        compact ? "p-3.5" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-ocean-700 dark:text-ocean-300">
          <Lightbulb className="size-4 shrink-0" aria-hidden /> Impamvu
        </p>
        <ListenButton src={audio} />
      </div>
      <p className={cn("mt-1.5 leading-relaxed text-ink-soft", compact ? "text-sm" : "text-[0.98rem]")}>{text}</p>
      {lawRef && (
        <p className="mt-3 inline-flex max-w-full items-start gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-line">
          <Scale className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>{lawRef}</span>
        </p>
      )}
    </div>
  );
}
