"use client";

import { type KeyboardEvent, type PointerEvent, useState } from "react";

import { useMeasuredWidth } from "./use-measure";

export type TrendPoint = { key: string; label: string; value: number; detail?: string };
type Threshold = { value: number; label: string };

const PAD = { top: 18, right: 46, bottom: 30, left: 30 };

/**
 * Single-series line (2px) with a 10% area wash, ≥8px markers ringed in the surface colour,
 * threshold rules, a direct label on the last point, and a crosshair tooltip that snaps to the
 * nearest point (pointer and keyboard).
 */
export function LineTrendChart({
  points,
  yMax,
  ticks,
  thresholds = [],
  height = 250,
  valueSuffix = "",
  label,
}: {
  points: TrendPoint[];
  yMax: number;
  ticks: number[];
  thresholds?: Threshold[];
  height?: number;
  valueSuffix?: string;
  label: string;
}) {
  const [ref, measured] = useMeasuredWidth<HTMLDivElement>();
  const width = measured ?? 0;
  const [active, setActive] = useState<number | null>(null);

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i * innerW) / (points.length - 1));
  const y = (v: number) => PAD.top + innerH - (Math.min(v, yMax) / yMax) * innerH;
  const last = points.length - 1;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length > 1 ? `${line} L${x(last).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z` : "";
  const labelStep = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerW / 90))));

  function nearest(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const index = points.length <= 1 ? 0 : Math.round((px / bounds.width) * (points.length - 1));
    setActive(Math.min(last, Math.max(0, index)));
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? -1) + 1));
    if (event.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? last + 1) - 1));
  }

  const point = active !== null ? points[active] : null;
  const tooltipLeft = active !== null ? Math.min(width - 90, Math.max(90, x(active))) : 0;

  return (
    <div
      ref={ref}
      className="relative w-full min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
      tabIndex={0}
      role="img"
      aria-label={label}
      onKeyDown={onKey}
      onFocus={() => setActive(last)}
      onBlur={() => setActive(null)}
    >
      {measured === null ? (
        <div style={{ height }} />
      ) : (
      <svg width={width} height={height} className="block overflow-visible" aria-hidden>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {thresholds.map((t) => (
          <g key={t.label}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t.value)}
              y2={y(t.value)}
              stroke="var(--chart-ref)"
              strokeWidth={1}
              strokeDasharray="5 4"
            />
            <text x={width - PAD.right + 6} y={y(t.value)} dy="0.32em" className="fill-muted text-[11px] font-semibold">
              {t.label}
            </text>
          </g>
        ))}
        {area && <path d={area} fill="var(--chart-1)" fillOpacity={0.1} />}
        <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {active !== null && (
          <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--chart-ref)" strokeWidth={1} />
        )}
        {points.map((p, i) => (
          <circle
            key={p.key}
            cx={x(i)}
            cy={y(p.value)}
            r={i === active ? 6 : 4}
            fill="var(--chart-1)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}
        {last >= 0 && active === null && (
          <text x={x(last) + 9} y={y(points[last].value)} dy="0.32em" className="fill-ink text-[12px] font-bold">
            {points[last].value}
          </text>
        )}
        {points.map((p, i) =>
          (i % labelStep === 0 && (last - i) * (innerW / Math.max(1, last)) > 56) || i === last ? (
            <text key={`l-${p.key}`} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
              {p.label}
            </text>
          ) : null,
        )}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={nearest}
          onPointerLeave={() => setActive(null)}
        />
      </svg>
      )}
      {point && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-line bg-surface px-3 py-2 shadow-lift"
          style={{ left: tooltipLeft, top: Math.max(0, y(point.value) - 12) }}
        >
          <p className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-0.5 w-3 rounded-full bg-chart-1" />
            <span className="font-display text-base font-extrabold">
              {point.value}
              {valueSuffix}
            </span>
          </p>
          <p className="whitespace-nowrap text-xs text-muted">{point.detail ?? point.label}</p>
        </div>
      )}
    </div>
  );
}
