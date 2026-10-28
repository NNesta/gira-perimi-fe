// Shared pieces of the generated link-preview pictures (next/og): the brand fonts and the logo mark.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROAD = "M10 25.5 18.6 34c3.2-6.4 8.8-13.3 16.4-19.6";
// Same artwork as LogoMark and icon.svg.
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#129b68"/><stop offset="1" stop-color="#0077b8"/></linearGradient>
    <clipPath id="c"><rect width="48" height="48" rx="13"/></clipPath>
  </defs>
  <g clip-path="url(#c)"><rect width="48" height="48" fill="url(#g)"/><path d="M0 36c8-5 15-6 23-3s16 2 25-5v20H0z" fill="#fff" opacity=".13"/></g>
  <circle cx="37" cy="11.2" r="5.4" fill="#fad201"/>
  <path d="${ROAD}" fill="none" stroke="#fff" stroke-width="7.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${ROAD}" fill="none" stroke="#fad201" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.4 2.7"/>
</svg>`;

export const LOGO_MARK = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;

export const BRAND_GRADIENT = "linear-gradient(135deg, #0f9465 0%, #0a8571 45%, #0077b8 100%)";

function font(file: string) {
  return readFile(join(process.cwd(), "src/assets/fonts", file));
}

// Loaded once per process, at module level, so static images are still prerendered at build time.
const [display, body, bold] = await Promise.all([
  font("bricolage-grotesque-800.woff"),
  font("plus-jakarta-sans-600.woff"),
  font("plus-jakarta-sans-700.woff"),
]);

export const OG_FONTS = [
  { name: "Bricolage", data: display, weight: 800 as const, style: "normal" as const },
  { name: "Jakarta", data: body, weight: 600 as const, style: "normal" as const },
  { name: "Jakarta", data: bold, weight: 700 as const, style: "normal" as const },
];

/** The Rwandan-flag stripe along the bottom of every picture. */
export function FlagStripe() {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, display: "flex" }}>
      <div style={{ width: "50%", background: "#00a1de" }} />
      <div style={{ width: "25%", background: "#fad201" }} />
      <div style={{ width: "25%", background: "#20603d" }} />
    </div>
  );
}
