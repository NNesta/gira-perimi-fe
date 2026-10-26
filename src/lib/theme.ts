// Colour theme: "system" follows the device, "light" / "dark" are explicit choices.
// The choice lives on <html data-theme> and in localStorage (a per-browser convenience).

export type ThemePreference = "system" | "light" | "dark";

export const THEMES: ThemePreference[] = ["system", "light", "dark"];
const STORAGE_KEY = "gp-theme";
const CHANGE_EVENT = "gp-themechange";
const BROWSER_BAR = { light: "#ffffff", dark: "#0d1628" };

/** Runs in <head> before the first paint, so a saved theme never flashes the default one. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function readTheme(): ThemePreference {
  const value = document.documentElement.dataset.theme;
  return isPreference(value) ? value : "system";
}

function syncBrowserBar(theme: ThemePreference) {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const media = meta.getAttribute("media") ?? "";
    const fallback = media.includes("dark") ? BROWSER_BAR.dark : BROWSER_BAR.light;
    meta.content = theme === "system" ? fallback : BROWSER_BAR[theme];
  }
}

export function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
  syncBrowserBar(theme);
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage blocked (private mode): the choice still applies to this page
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscription for useSyncExternalStore: this tab's changes plus changes made in other tabs. */
export function subscribeTheme(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const next = isPreference(event.newValue) ? event.newValue : "system";
    document.documentElement.dataset.theme = next;
    syncBrowserBar(next);
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Whether the page is showing dark colours right now: an explicit choice, or "system" on a dark device. */
export function isDarkTheme(): boolean {
  const theme = readTheme();
  return theme === "dark" || (theme === "system" && window.matchMedia(DARK_QUERY).matches);
}

/** Subscription for isDarkTheme: theme choices plus the device switching between light and dark. */
export function subscribeResolvedTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  const unsubscribe = subscribeTheme(onChange);
  return () => {
    media.removeEventListener("change", onChange);
    unsubscribe();
  };
}
