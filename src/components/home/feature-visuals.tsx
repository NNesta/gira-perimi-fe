/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */
import { Check, CircleCheck, Volume2, WifiOff } from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

import { CountdownChip } from "./countdown-chip";

// Small drawings of the product for the home page's feature cards: markup and SVG only, in the site's colour tokens,
// so they follow the light/dark theme. Decorative: each card's title and text say the same thing in words.

/** A running mock exam: the clock, the 20-question map (6 answered, the 7th open) and the progress bar. */
export function ExamVisual() {
  return (
    <div className="w-full max-w-xs rounded-2xl border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-muted">Ikibazo 7/20</span>
        <CountdownChip />
      </div>
      <div className="mt-3.5 grid grid-cols-10 gap-1.5">
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-[5px]",
              i < 6 && "bg-brand-500",
              i === 6 && "bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-500/15",
              i > 6 && "bg-surface-2",
            )}
          />
        ))}
      </div>
      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
      </div>
    </div>
  );
}

const SCORES = [11, 13, 12, 14, 15, 14, 16, 17, 16, 18];

/** Mock-exam scores climbing past the pass mark (12) towards 18/20. */
export function ProgressVisual() {
  const w = 260;
  const h = 128;
  const x = (i: number) => 14 + (i * (w - 64)) / (SCORES.length - 1);
  const y = (score: number) => h - 14 - ((score - 8) / 12) * (h - 34);
  const line = SCORES.map((s, i) => `${i ? "L" : "M"}${x(i)} ${y(s)}`).join("");
  const last = SCORES.length - 1;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-[17rem]" aria-hidden>
      <defs>
        <linearGradient id="feature-trend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--chart-1)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={x(0)} x2={x(last)} y1={y(12)} y2={y(12)} stroke="var(--chart-ref)" strokeDasharray="4 4" />
      <text x={x(last) + 8} y={y(12)} dy="0.32em" className="fill-muted text-[10px] font-semibold">
        12
      </text>
      <path d={`${line}L${x(last)} ${h - 14}L${x(0)} ${h - 14}Z`} fill="url(#feature-trend)" />
      <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {SCORES.map((s, i) => (
        <circle key={i} cx={x(i)} cy={y(s)} r={i === last ? 5 : 2.5} fill={i === last ? "var(--surface)" : "var(--chart-1)"} stroke="var(--chart-1)" strokeWidth={i === last ? 3 : 0} />
      ))}
      <g transform={`translate(${x(last) - 16} ${y(SCORES[last]) - 30})`}>
        <rect width="46" height="20" rx="10" className="fill-asphalt dark:fill-white" />
        <text x="23" y="10" dy="0.34em" textAnchor="middle" className="fill-white font-display text-[11px] font-extrabold dark:fill-asphalt">
          18/20
        </text>
      </g>
    </svg>
  );
}

const FAN = [
  { id: "a-15", className: "-translate-x-[5.25rem] translate-y-1 rotate-[-14deg] group-hover:-translate-x-24 group-hover:rotate-[-18deg]" },
  { id: "e-11", className: "translate-x-[5.25rem] translate-y-1 rotate-[14deg] group-hover:translate-x-24 group-hover:rotate-[18deg]" },
  { id: "b-2a", className: "z-10 -translate-y-1 group-hover:-translate-y-3" },
];

/** Three real signs from the catalogue, fanned out like flashcards (they spread when the card is hovered). */
export function SignsVisual() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      {FAN.map((sign) => (
        <div
          key={sign.id}
          className={cn(
            "paper absolute grid size-24 place-items-center p-2.5 shadow-lift ring-1 ring-black/5 transition-transform duration-500 ease-out",
            sign.className,
          )}
        >
          <img src={`/media/signs/${sign.id}.webp`} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

const WAVE = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.65, 0.4, 0.8, 0.95, 0.55, 0.7, 0.45, 0.85, 0.6, 0.3, 0.7, 0.5, 0.9, 0.4];

/** "Umva": the listen button with a voice playing. */
export function AudioVisual() {
  return (
    <div className="flex w-full max-w-[15rem] flex-col items-center gap-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgb(0_150_220/0.8)]">
        <Volume2 className="size-4 fill-current" aria-hidden /> Umva
      </span>
      <div className="flex h-12 w-full items-center justify-between gap-[3px]">
        {WAVE.map((v, i) => (
          <span
            key={i}
            className="animate-eq w-full rounded-full bg-gradient-to-t from-ocean-500 to-brand-400"
            style={{ height: `${v * 100}%`, animationDelay: `${-(i * 0.13) % 1.1}s` } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

/** An intersection from above: the car coming from the right goes first (priority to the right). */
export function IntersectionVisual() {
  return (
    <svg viewBox="0 0 220 140" className="h-full max-h-36 w-auto" aria-hidden>
      <rect width="220" height="140" rx="14" style={{ fill: "var(--hill-mid)" }} />
      <rect y="50" width="220" height="40" style={{ fill: "var(--road)" }} />
      <rect x="90" width="40" height="140" style={{ fill: "var(--road)" }} />
      <path d="M0 70H84M136 70H220M110 0V44M110 96V140" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="8 7" />
      <path d="M90 92H130M90 48H130M88 50V90M132 50V90" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2.5" />
      {/* from the south, heading north: waits */}
      <g transform="translate(120 112)">
        <rect x="-7" y="-11" width="14" height="22" rx="4" fill="#129b68" />
        <rect x="-5" y="-7" width="10" height="5" rx="1.5" fill="#cbeeff" />
      </g>
      {/* from the east, heading west: goes first */}
      <g transform="translate(160 60)">
        <circle r="16" fill="none" stroke="#fad201" strokeWidth="2.5" className="animate-ping transform-fill origin-center" />
        <rect x="-11" y="-7" width="22" height="14" rx="4" fill="#0096dc" />
        <rect x="-7" y="-5" width="5" height="10" rx="1.5" fill="#cbeeff" />
      </g>
      <g className="font-display text-[11px] font-extrabold">
        <circle cx="160" cy="34" r="10" fill="#fad201" />
        <text x="160" y="34" dy="0.35em" textAnchor="middle" fill="#1b2433">
          1
        </text>
        <circle cx="146" cy="112" r="10" fill="#ffffff" />
        <text x="146" y="112" dy="0.35em" textAnchor="middle" fill="#1b2433">
          2
        </text>
      </g>
    </svg>
  );
}

/** The question bank saved on the phone, usable with no connection. */
export function OfflineVisual({ questions }: { questions: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-[4.5rem] shrink-0 rounded-[1.1rem] border-[3px] border-asphalt bg-surface p-1.5 dark:border-white/25">
        <span className="mx-auto block h-1 w-6 rounded-full bg-asphalt/80 dark:bg-white/30" />
        <span className="mt-2.5 block h-2 w-10 rounded bg-brand-500/80" />
        <span className="mt-1.5 block h-1.5 w-full rounded bg-surface-2" />
        <span className="mt-1 block h-1.5 w-4/5 rounded bg-surface-2" />
        <span className="mt-2.5 block h-3 w-full rounded-md bg-surface-2" />
        <span className="mt-1 block h-3 w-full rounded-md bg-brand-100 ring-1 ring-brand-400 dark:bg-brand-500/20" />
        <span className="mt-1 block h-3 w-full rounded-md bg-surface-2" />
      </div>
      <div className="space-y-2 text-xs font-bold">
        <span className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 text-signal-600 shadow-soft ring-1 ring-line dark:text-signal-400">
          <WifiOff className="size-3.5" aria-hidden /> Nta interineti
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 text-brand-700 shadow-soft ring-1 ring-line dark:text-brand-300">
          <CircleCheck className="size-3.5" aria-hidden /> Ibibazo {questions} birahari
        </span>
      </div>
    </div>
  );
}

/** A question from the booklet with its options, the right one ticked. */
export function QuestionVisual() {
  return (
    <div className="w-full max-w-[15rem] space-y-1.5">
      <span className="mb-3 block h-2.5 w-4/5 rounded-full bg-ink/15" />
      {["A", "B", "C"].map((letter) => {
        const right = letter === "B";
        return (
          <div
            key={letter}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-1.5",
              right ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15" : "border-line bg-surface",
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-md text-[0.65rem] font-bold",
                right ? "bg-brand-500 text-white" : "bg-surface-2 text-ink-soft",
              )}
            >
              {right ? <Check className="size-3" strokeWidth={3} aria-hidden /> : letter}
            </span>
            <span className={cn("h-2 flex-1 rounded-full", right ? "bg-brand-500/40" : "bg-surface-2")} />
          </div>
        );
      })}
    </div>
  );
}

/** Everything is free for now. */
export function FreeVisual() {
  return (
    <div className="text-center">
      <p className="text-gradient font-display text-6xl font-extrabold leading-none">0 Frw</p>
      <p className="mt-3 flex flex-wrap justify-center gap-1.5 text-[0.7rem] font-bold text-muted">
        {["Amasomo", "Imyitozo", "Ibizamini"].map((item) => (
          <span key={item} className="rounded-full bg-surface px-2.5 py-1 ring-1 ring-line">
            {item}
          </span>
        ))}
      </p>
    </div>
  );
}
