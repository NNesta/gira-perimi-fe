"use client";
/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */

import { Check, Grid3x3, Layers, RotateCcw, Search, Shuffle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import type { Sign, SignCategory } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  biburira: "bg-signal-500",
  "gutambuka-mbere": "bg-sun-400",
  bibuza: "bg-signal-600",
  bitegeka: "bg-ocean-500",
  biyobora: "bg-ocean-600",
  nyongera: "bg-asphalt",
  imirongo: "bg-brand-600",
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "");
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Flashcards({ signs, onExit }: { signs: Sign[]; onExit: () => void }) {
  const [deck, setDeck] = useState(() => shuffle(signs).slice(0, 20));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const card = deck[index];
  const finished = index >= deck.length;

  function answer(knewIt: boolean) {
    if (knewIt) setKnown((k) => k + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setDeck(shuffle(signs).slice(0, 20));
    setIndex(0);
    setKnown(0);
    setFlipped(false);
  }

  if (finished) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Ibyapa wamenye</p>
        <p className="mt-2 font-display text-6xl font-extrabold">
          {known}
          <span className="text-3xl text-muted">/{deck.length}</span>
        </p>
        <p className="mt-4 text-muted">
          {known / deck.length >= 0.8 ? "Uri intyoza mu byapa! Komereza aho." : "Komeza witoze: buri gusubiramo kugufasha kwibuka."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={restart}>
            <Shuffle className="size-4" /> Ibindi byapa 20
          </Button>
          <Button variant="secondary" onClick={onExit}>
            <Grid3x3 className="size-4" /> Subira ku rutonde
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-4">
        <ProgressBar value={index} max={deck.length} label="Amakarita" />
        <span className="shrink-0 text-sm font-bold text-muted">
          {index + 1}/{deck.length}
        </span>
      </div>
      <div className="[perspective:1400px]">
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Subiza ikarita" : "Garagaza igisobanuro"}
          className="relative block h-[26rem] w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <span className="card absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 [backface-visibility:hidden]">
            <span className="paper flex size-56 items-center justify-center border border-line p-4 shadow-soft">
              <img src={card.image} alt="Icyapa cyo kumenya" className="max-h-44 max-w-44 object-contain" />
            </span>
            <span className="text-sm font-semibold text-muted">Kanda ku ikarita urebe igisobanuro</span>
          </span>
          <span className="card absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold tracking-wide text-muted">
              {card.code}
            </span>
            <span className="font-display text-2xl font-extrabold sm:text-3xl">{card.name}</span>
            <span className="max-w-sm leading-relaxed text-muted">{card.description}</span>
          </span>
        </motion.button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={() => answer(false)}>
          <X className="size-5 text-signal-500" /> Sinari nkizi
        </Button>
        <Button size="lg" onClick={() => answer(true)}>
          <Check className="size-5" /> Nari nkizi
        </Button>
      </div>
      <button type="button" onClick={onExit} className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <RotateCcw className="size-4" /> Subira ku rutonde rw’ibyapa
      </button>
    </div>
  );
}

export function SignsExplorer({ categories, signs }: { categories: SignCategory[]; signs: Sign[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>("byose");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"grid" | "cards">("grid");

  const openId = searchParams.get("icyapa");
  const openSign = useMemo(() => signs.find((s) => s.id === openId) ?? null, [signs, openId]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return signs.filter(
      (s) =>
        (category === "byose" || s.category === category) &&
        (!q || normalize(`${s.code} ${s.name} ${s.description}`).includes(q)),
    );
  }, [signs, category, query]);

  function open(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("icyapa", id);
    else params.delete("icyapa");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const tabs = [{ id: "byose", name: "Byose", count: signs.length }, ...categories];

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg/90 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-b-3xl sm:px-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Shakisha icyapa</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Shakisha icyapa: izina, kode (urugero A.10), cyangwa ijambo..."
              className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-[0.95rem] shadow-soft outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
          </label>
          <div className="flex shrink-0 rounded-2xl border border-line bg-surface p-1 shadow-soft">
            {(
              [
                { id: "grid", label: "Urutonde", icon: Grid3x3 },
                { id: "cards", label: "Amakarita", icon: Layers },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-pressed={mode === item.id}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition",
                  mode === item.id ? "bg-asphalt text-white dark:bg-white dark:text-asphalt" : "text-muted hover:text-ink",
                )}
              >
                <item.icon className="size-4" /> {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              aria-pressed={category === tab.id}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                category === tab.id
                  ? "border-brand-500 bg-brand-500 text-white shadow-soft"
                  : "border-line bg-surface text-ink-soft hover:border-brand-300",
              )}
            >
              {tab.id !== "byose" && <span className={cn("size-2.5 rounded-full", CATEGORY_STYLES[tab.id])} />}
              {tab.name}
              <span className={cn("text-xs", category === tab.id ? "text-white/80" : "text-muted")}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {mode === "cards" ? (
          filtered.length > 0 ? (
            <Flashcards key={`${category}-${query}`} signs={filtered} onExit={() => setMode("grid")} />
          ) : null
        ) : (
          <>
            {category !== "byose" && (
              <p className="mb-6 max-w-3xl text-muted">{categories.find((c) => c.id === category)?.description}</p>
            )}
            <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              <AnimatePresence initial={false}>
                {filtered.map((sign) => (
                  <motion.li
                    key={sign.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.18 }}
                  >
                    <button
                      type="button"
                      onClick={() => open(sign.id)}
                      className="group flex h-full w-full flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center shadow-soft transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
                    >
                      <span className="paper flex h-28 w-full items-center justify-center p-2">
                        <img src={sign.image} alt={sign.name} className="max-h-24 max-w-full object-contain transition group-hover:scale-105" loading="lazy" />
                      </span>
                      <span className="text-[0.7rem] font-bold tracking-wide text-muted">{sign.code}</span>
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{sign.name}</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
        {filtered.length === 0 && (
          <div className="card mx-auto max-w-md p-10 text-center">
            <p className="font-bold">Nta cyapa kibonetse</p>
            <p className="mt-2 text-muted">Gerageza irindi jambo cyangwa uhitemo “Byose”.</p>
          </div>
        )}
      </div>

      <Dialog open={!!openSign} onClose={() => open(null)} size="md">
        {openSign && (
          <div className="flex flex-col items-center text-center">
            <span className="paper flex size-60 items-center justify-center border border-line p-5 shadow-soft">
              <img src={openSign.image} alt={openSign.name} className="max-h-48 max-w-48 object-contain" />
            </span>
            <span className="mt-6 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold tracking-wide text-muted">
              {openSign.code} · {categories.find((c) => c.id === openSign.category)?.name}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold">{openSign.name}</h2>
            <p className="mt-3 max-w-md leading-relaxed text-muted">{openSign.description}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
