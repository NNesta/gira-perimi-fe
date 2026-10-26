"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { applyTheme, readTheme, subscribeTheme, type ThemePreference, THEMES } from "@/lib/theme";

const OPTIONS: Record<ThemePreference, { label: string; hint: string; icon: typeof Sun }> = {
  system: { label: "Sisitemu", hint: "Bikurikiza igikoresho cyawe", icon: Monitor },
  light: { label: "Umucyo", hint: "Amabara y’umucyo igihe cyose", icon: Sun },
  dark: { label: "Umwijima", hint: "Amabara y’umwijima igihe cyose", icon: Moon },
};

function useTheme(): ThemePreference {
  // The server always renders "system"; the client reads what the pre-paint script set on <html>.
  return useSyncExternalStore(subscribeTheme, readTheme, () => "system");
}

/** Three-way segmented control: Sisitemu / Umucyo / Umwijima. */
export function ThemeSegmented({
  onDark = false,
  iconsOnly = false,
  className,
}: {
  onDark?: boolean;
  /** For narrow spots (admin sidebar): icons with tooltips instead of visible labels. */
  iconsOnly?: boolean;
  className?: string;
}) {
  const theme = useTheme();
  const pillId = useId();
  return (
    <div
      role="radiogroup"
      aria-label="Amabara y’urubuga"
      className={cn(
        "inline-flex rounded-2xl p-1",
        onDark ? "bg-white/8 ring-1 ring-white/10" : "bg-surface-2 ring-1 ring-line",
        className,
      )}
    >
      {THEMES.map((value) => {
        const { label, icon: Icon } = OPTIONS[value];
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={iconsOnly ? label : undefined}
            title={iconsOnly ? label : undefined}
            onClick={() => applyTheme(value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? onDark
                  ? "text-asphalt"
                  : "text-ink"
                : onDark
                  ? "text-white/60 hover:text-white"
                  : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`theme-pill-${pillId}`}
                className={cn("absolute inset-0 rounded-xl shadow-soft", onDark ? "bg-white" : "bg-surface")}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <Icon className="relative size-3.5" aria-hidden />
            {!iconsOnly && <span className="relative">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Compact header control: an icon button that opens the three choices. */
export function ThemeMenu({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Current = OPTIONS[theme].icon;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Amabara y’urubuga: ${OPTIONS[theme].label}`}
        title="Amabara y’urubuga"
        className={cn(
          "grid size-10 place-items-center rounded-xl transition",
          onDark ? "text-white/70 hover:bg-white/8 hover:text-white" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            <Current className="size-[1.15rem]" aria-hidden />
          </motion.span>
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Amabara y’urubuga"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface p-1.5 text-ink shadow-lift"
          >
            <p className="px-3 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Amabara y’urubuga</p>
            {THEMES.map((value) => {
              const { label, hint, icon: Icon } = OPTIONS[value];
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    applyTheme(value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    active ? "bg-brand-50 dark:bg-brand-500/15" : "hover:bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      active ? "bg-brand-500 text-white" : "bg-surface-2 text-muted",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
