import type { ReactNode } from "react";

export type BarRow = {
  key: string;
  label: string;
  /** 0..1, or null when there is no data yet */
  ratio: number | null;
  value: string;
  detail: string;
  action?: ReactNode;
};

/**
 * Horizontal bars for nominal categories: one hue for every bar (identity is the label, not the
 * colour), 12px thick with a 4px rounded data end, value at the tip, details on hover/focus.
 */
export function BarList({ rows, label }: { rows: BarRow[]; label: string }) {
  return (
    <ul aria-label={label} className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.key} className="group relative">
          <div
            tabIndex={0}
            className="grid grid-cols-[minmax(0,9.5rem)_1fr_auto] items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 sm:grid-cols-[minmax(0,13rem)_1fr_auto]"
          >
            <span className="truncate text-sm font-semibold text-ink-soft" title={row.label}>
              {row.label}
            </span>
            <span className="relative h-3 rounded-r bg-surface-2">
              {row.ratio !== null && (
                <span
                  className="absolute inset-y-0 left-0 rounded-r-[4px] bg-chart-1 transition-[width] duration-700"
                  style={{ width: `${Math.max(1.5, row.ratio * 100)}%` }}
                />
              )}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-11 text-right text-sm font-bold tabular-nums">{row.value}</span>
              {row.action}
            </span>
          </div>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-muted shadow-lift group-focus-within:block group-hover:block"
          >
            <strong className="mr-1.5 font-display text-sm text-ink">{row.value}</strong>
            {row.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}
