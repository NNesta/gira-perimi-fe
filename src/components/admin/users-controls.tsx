"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";

const SORTS = [
  { value: "joined", label: "Igihe biyandikishije" },
  { value: "last_active", label: "Abaheruka gukoresha" },
  { value: "average", label: "Impuzandengo" },
  { value: "exams", label: "Umubare w’ibizamini" },
  { value: "name", label: "Amazina" },
];

/** Search + sort for the students table; state lives in the URL so the server renders the page. */
export function UsersControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = window.setTimeout(() => update({ q: query.trim() || null }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce only on typing
  }, [query]);

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", pending && "opacity-70")}>
      <label className="relative flex-1">
        <span className="sr-only">Shakisha umunyeshuri</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Shakisha izina cyangwa imeyili..."
          className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-3 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
      </label>
      <div className="flex gap-2">
        <select
          aria-label="Tondeka ukurikije"
          value={params.get("sort") ?? "joined"}
          onChange={(e) => update({ sort: e.target.value })}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold outline-none focus:border-brand-400"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Uburyo bwo gutondeka"
          value={params.get("order") ?? "desc"}
          onChange={(e) => update({ order: e.target.value })}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold outline-none focus:border-brand-400"
        >
          <option value="desc">Hejuru → hasi</option>
          <option value="asc">Hasi → hejuru</option>
        </select>
      </div>
    </div>
  );
}
