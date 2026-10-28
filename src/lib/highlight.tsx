import type { ReactNode } from "react";

/** Same folding as the API's search: lower case, no accents, no apostrophes. */
export function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’‘ʼ`´]/g, "");
}

export function searchWords(query: string): string[] {
  return fold(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
}

/** Wraps every occurrence of the words in <mark>, matching "y’umuhanda" for "yumuhanda" or "Umuhanda". */
export function highlight(text: string, words: string[]): ReactNode {
  if (!words.length) return text;
  const folded: string[] = [];
  const origin: number[] = []; // index in `text` of each folded character
  for (let i = 0; i < text.length; i++) {
    for (const char of fold(text[i])) {
      folded.push(char);
      origin.push(i);
    }
  }
  const haystack = folded.join("");
  const ranges: [number, number][] = [];
  for (const word of words) {
    for (let at = haystack.indexOf(word); at !== -1; at = haystack.indexOf(word, at + word.length)) {
      ranges.push([origin[at], origin[at + word.length - 1] + 1]);
    }
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const last = merged.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  const parts: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={i} className="rounded bg-sun-200/80 px-0.5 text-ink dark:bg-sun-400/30">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
