"use client";

import { type KeyboardEvent, useState } from "react";

import { niceMax, useMeasuredWidth } from "./use-measure";

export type Column = { key: string; label: string; value: number; detail?: string };

const PAD = { top: 14, right: 8, bottom: 26, left: 30 };

function columnPath(x0: number, x1: number, top: number, base: number) {
  const r = Math.min(4, (x1 - x0) / 2, base - top);
  return `M${x0} ${base}L${x0} ${top + r}Q${x0} ${top} ${x0 + r} ${top}L${x1 - r} ${top}Q${x1} ${top} ${x1} ${top + r}L${x1} ${base}Z`;
}

/**
 * Single-series columns: ≤24px wide, 4px rounded data end, square at the baseline, ≥2px gaps,
 * hairline grid, per-column hover/focus tooltip with a hit area the size of the whole slot.
 */
export function ColumnChart({
  data,
  color = "var(--chart-1)",
  height = 190,
  label,
  marker,
  valueSuffix = "",
  labelEvery,
}: {
  data: Column[];
  color?: string;
  height?: number;
  label: string;
  marker?: { index: number; label: string };
  /** Plain text after the value in the tooltip (functions cannot cross the server/client boundary). */
  valueSuffix?: string;
  labelEvery?: number;
}) {
  const [ref, measured] = useMeasuredWidth<HTMLDivElement>();
  const width = measured ?? 0;
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const ticks = [0, max / 2, max];
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(24, slot - 2));
  const base = PAD.top + innerH;
  const y = (v: number) => base - (v / max) * innerH;
  const every = labelEvery ?? Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 44))));

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") setActive((a) => Math.min(data.length - 1, (a ?? -1) + 1));
    if (event.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? data.length) - 1));
  }

  const current = active !== null ? data[active] : null;
  const tipX = active !== null ? Math.min(width - 70, Math.max(70, PAD.left + slot * active + slot / 2)) : 0;

  return (
    <div
      ref={ref}
      className="relative w-full min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
      tabIndex={0}
      role="img"
      aria-label={label}
      onKeyDown={onKey}
      onFocus={() => setActive(data.length - 1)}
      onBlur={() => setActive(null)}
      onPointerLeave={() => setActive(null)}
    >
      {measured === null ? (
        <div style={{ height }} />
      ) : (
      <svg width={width} height={height} className="block" aria-hidden>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={PAD.left - 7} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {Number.isInteger(t) ? t : t.toFixed(1)}
            </text>
          </g>
        ))}
        {marker && (
          <g>
            <line
              x1={PAD.left + slot * marker.index}
              x2={PAD.left + slot * marker.index}
              y1={PAD.top - 4}
              y2={base}
              stroke="var(--chart-ref)"
              strokeWidth={1}
              strokeDasharray="5 4"
            />
            <text x={PAD.left + slot * marker.index + 5} y={PAD.top + 6} className="fill-muted text-[11px] font-semibold">
              {marker.label}
            </text>
          </g>
        )}
        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const x0 = cx - barW / 2;
          return (
            <g key={d.key}>
              {d.value > 0 && (
                <path
                  d={columnPath(x0, x0 + barW, y(d.value), base)}
                  fill={color}
                  opacity={active === null || active === i ? 1 : 0.45}
                  className="transition-opacity"
                />
              )}
              {((i % every === 0 && data.length - 1 - i >= Math.ceil(every / 2)) || i === data.length - 1) && (
                <text
                  x={i === data.length - 1 ? PAD.left + slot * (i + 1) : cx}
                  y={height - 7}
                  textAnchor={i === data.length - 1 && data.length > 1 ? "end" : "middle"}
                  className="fill-muted text-[11px]"
                >
                  {d.label}
                </text>
              )}
              <rect
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={innerH}
                fill="transparent"
                onPointerEnter={() => setActive(i)}
              />
            </g>
          );
        })}
      </svg>
      )}
      {current && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-line bg-surface px-3 py-2 shadow-lift"
          style={{ left: tipX, top: 0 }}
        >
          <p className="flex items-center gap-2 whitespace-nowrap">
            <span className="size-2.5 rounded-sm" style={{ background: color }} />
            <span className="font-display text-base font-extrabold">
              {current.value}
              {valueSuffix}
            </span>
          </p>
          <p className="whitespace-nowrap text-xs text-muted">{current.detail ?? current.label}</p>
        </div>
      )}
    </div>
  );
}
