// Text size: scales the root font size, so all text and spacing (rem-based) grow together, like a gentle zoom.
// The choice lives on <html data-text-size> and in localStorage (a per-browser convenience), like the colour theme.

export type TextSize = "sm" | "md" | "lg" | "xl";

export const TEXT_SIZES: TextSize[] = ["sm", "md", "lg", "xl"];
export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  sm: "Bito",
  md: "Bisanzwe",
  lg: "Binini",
  xl: "Binini cyane",
};
const STORAGE_KEY = "gp-text-size";
const CHANGE_EVENT = "gp-textsizechange";

/** Runs in <head> before the first paint, so a saved size never flashes the default one. */
export const TEXT_SIZE_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");if(s==="sm"||s==="lg"||s==="xl")document.documentElement.setAttribute("data-text-size",s)}catch(e){}})()`;

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && (TEXT_SIZES as string[]).includes(value);
}

export function readTextSize(): TextSize {
  const value = document.documentElement.dataset.textSize;
  return isTextSize(value) ? value : "md";
}

export function applyTextSize(size: TextSize) {
  if (size === "md") delete document.documentElement.dataset.textSize;
  else document.documentElement.dataset.textSize = size;
  try {
    if (size === "md") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // storage blocked (private mode): the choice still applies to this page
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscription for useSyncExternalStore: this tab's changes plus changes made in other tabs. */
export function subscribeTextSize(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const next = isTextSize(event.newValue) ? event.newValue : "md";
    if (next === "md") delete document.documentElement.dataset.textSize;
    else document.documentElement.dataset.textSize = next;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
