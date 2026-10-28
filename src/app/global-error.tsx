"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/report-error";

/** Last resort when even the root layout fails: plain markup, no site styles, and the error is reported. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error), [error]);
  return (
    <html lang="rw">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f4f7fb", color: "#0b1324" }}>
        <main style={{ maxWidth: 420, margin: "18vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>Habaye ikibazo</h1>
          <p style={{ color: "#5d6779", lineHeight: 1.6 }}>Ntitwashoboye gufungura uru rupapuro. Ongera ugerageze mu kanya gato.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, padding: "12px 22px", borderRadius: 14, border: 0, background: "#129b68", color: "#fff", fontWeight: 700 }}
          >
            Ongera ugerageze
          </button>
        </main>
      </body>
    </html>
  );
}
