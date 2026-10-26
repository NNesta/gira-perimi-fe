/** Every chart ships a table twin: the values stay reachable without hovering or seeing colour. */
export function ChartTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg text-xs font-semibold text-muted transition hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="transition group-open:rotate-90">›</span> Reba imibare mu mbonerahamwe
      </summary>
      <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-surface-2">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className="px-3 py-2 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-line">
                {row.map((cell, c) => (
                  <td key={c} className="px-3 py-1.5 text-ink-soft">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
