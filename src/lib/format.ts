// Kinyarwanda formatting. Rwanda is UTC+2 all year, so dates are shifted by a fixed offset
// (identical on server and client, no hydration mismatch).

const KIGALI_OFFSET_MS = 2 * 60 * 60 * 1000;

export const MONTHS = [
  "Mutarama",
  "Gashyantare",
  "Werurwe",
  "Mata",
  "Gicurasi",
  "Kamena",
  "Nyakanga",
  "Kanama",
  "Nzeri",
  "Ukwakira",
  "Ugushyingo",
  "Ukuboza",
];
export const MONTHS_SHORT = ["Mut", "Gas", "Wer", "Mat", "Gic", "Kam", "Nya", "Kan", "Nze", "Ukw", "Ugu", "Uku"];
export const WEEKDAYS_SHORT = ["Cyu", "Mbe", "Kab", "Gat", "Kan", "Gnu", "Gtd"];

function kigali(value: string | Date): Date {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() + KIGALI_OFFSET_MS);
}

export function formatDate(value: string | Date): string {
  const d = kigali(value);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatShortDate(value: string | Date): string {
  const d = kigali(value);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

export function formatTime(value: string | Date): string {
  const d = kigali(value);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)}, saa ${formatTime(value)}`;
}

/** Calendar day from the API ("YYYY-MM-DD", already in Kigali time) → "24 Ukw". */
export function formatDay(day: string): string {
  const [, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

export function weekdayShort(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return WEEKDAYS_SHORT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function timeAgo(value: string | Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "nonaha";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hashize ${plural(minutes, "umunota", "iminota")}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hashize ${plural(hours, "isaha", "amasaha")}`;
  const days = Math.round(hours / 24);
  if (days === 1) return "ejo hashize";
  if (days < 30) return `hashize ${plural(days, "umunsi", "iminsi")}`;
  return formatDate(value);
}

/** Kinyarwanda puts the number after the noun: "ibibazo 20", "ikizamini 1". */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count === 1 ? singular : pluralForm} ${count.toLocaleString("fr-FR")}`;
}

export function formatScore(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(digits).replace(".", ",");
}

export function formatPercent(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) return "—";
  return `${Math.round(ratio * 100)}%`;
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined) return "—";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Greeting by the hour in Kigali. */
export function greeting(now: Date = new Date()): string {
  const hour = kigali(now).getUTCHours();
  if (hour < 12) return "Mwaramutse";
  return "Mwiriwe";
}

export function firstName(name: string | null | undefined, given?: string | null): string {
  return given || (name ? name.split(" ")[0] : "");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase();
}
