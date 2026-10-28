/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */
import { BookmarkCheck, CircleCheck, Info, Lightbulb, Scale, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { LessonDiagram } from "@/components/lessons/lesson-diagrams";
import { cn } from "@/lib/cn";
import type { LessonBlock } from "@/lib/types";

/** Renders **bold** spans from lesson text. */
export function RichText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const CALLOUTS = {
  tip: {
    label: "Inama",
    icon: Lightbulb,
    box: "border-brand-200 bg-brand-50/70 dark:border-brand-400/25 dark:bg-brand-500/10",
    badge: "bg-brand-500 text-white",
  },
  warning: {
    label: "Icyitonderwa",
    icon: TriangleAlert,
    box: "border-signal-200 bg-signal-50/70 dark:border-signal-400/25 dark:bg-signal-500/10",
    badge: "bg-signal-500 text-white",
  },
  info: {
    label: "Ibyo kumenya",
    icon: Info,
    box: "border-ocean-200 bg-ocean-50/70 dark:border-ocean-400/25 dark:bg-ocean-500/10",
    badge: "bg-ocean-500 text-white",
  },
  law: {
    label: "Itegeko rivuga",
    icon: Scale,
    box: "border-sun-300 bg-sun-50/70 dark:border-sun-300/25 dark:bg-sun-400/10",
    badge: "bg-sun-400 text-asphalt",
  },
  key: {
    label: "Ibyo kwibuka",
    icon: BookmarkCheck,
    box: "border-transparent bg-gradient-to-br from-asphalt to-[#24324a] text-white dark:from-[#14243f] dark:to-[#0f1a2e]",
    badge: "bg-sun-300 text-asphalt",
  },
} as const;

function BlockList({ items, ordered, onDark = false }: { items: string[]; ordered: boolean; onDark?: boolean }) {
  if (ordered) {
    return (
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3.5">
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold",
                onDark ? "bg-white/15 text-white" : "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200",
              )}
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          {onDark ? (
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-sun-300" />
          ) : (
            <span className="mt-[0.6rem] size-2 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-ocean-400" />
          )}
          <span className="leading-relaxed">
            <RichText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Block({ block, onDark = false }: { block: LessonBlock; onDark?: boolean }): ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="leading-[1.8]">
          <RichText text={block.text} />
        </p>
      );
    case "heading":
      return <h3 className="pt-2 text-xl font-bold text-ink">{block.text}</h3>;
    case "list":
      return <BlockList items={block.items} ordered={block.ordered} onDark={onDark} />;
    case "table":
      return (
        <div className="-mx-1 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[0.95rem]">
            <thead>
              <tr className="bg-surface-2">
                {block.head.map((cell, i) => (
                  <th key={i} className="px-4 py-3 font-bold text-ink">
                    <RichText text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-line">
                  {row.map((cell, c) => (
                    <td key={c} className={cn("px-4 py-3 align-top leading-relaxed", c === 0 && "font-semibold text-ink")}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const style = CALLOUTS[block.tone] ?? CALLOUTS.info;
      const Icon = style.icon;
      const dark = block.tone === "key";
      return (
        <aside className={cn("rounded-3xl border p-5 sm:p-6", style.box)}>
          <p className="flex items-center gap-2.5 font-bold">
            <span className={cn("grid size-8 place-items-center rounded-xl", style.badge)}>
              <Icon className="size-4" />
            </span>
            <span className={dark ? "text-white" : "text-ink"}>{block.title || style.label}</span>
          </p>
          <div className={cn("mt-4 space-y-3", dark ? "text-white/90" : "text-ink-soft", block.tone === "law" && "italic")}>
            {block.blocks.map((inner, i) => (
              <Block key={i} block={inner} onDark={dark} />
            ))}
          </div>
        </aside>
      );
    }
    case "diagram":
      return <LessonDiagram name={block.name} />;
    case "signs":
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {block.signs.map((sign) => (
            <Link
              key={sign.id}
              href={`/ibyapa?icyapa=${sign.id}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
            >
              <span className="paper flex h-24 w-full items-center justify-center p-2">
                <img src={sign.image} alt={sign.name} className="max-h-20 max-w-full object-contain" loading="lazy" />
              </span>
              <span className="text-[0.7rem] font-bold tracking-wide text-muted">{sign.code}</span>
              <span className="text-sm font-semibold leading-snug text-ink">{sign.name}</span>
            </Link>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-5 text-[1.05rem] text-ink-soft">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
