"use client";

import { BellRing, LoaderCircle, Send, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { disablePush, enablePush, pushStatus, syncPush, type PushStatus } from "@/lib/push";

const NOTES: Partial<Record<PushStatus, string>> = {
  "needs-install":
    "Kuri iPhone, banza ushyire Tsinda Neza kuri ecran: kanda Share, hanyuma “Add to Home Screen”. Uyifungure aho, ugaruke hano.",
  blocked: "Imenyesha ryahagaritswe kuri iyi browser. Rifungure mu igenamiterere ryayo (Notifications), hanyuma ugaruke hano.",
  unsupported: "Iyi browser ntishobora kwakira imenyesha. Kuri Android, koresha Chrome.",
};

/**
 * "Nyibutsa kuri telefoni": the daily reminder as a phone notification, for this browser only. It takes effect at
 * once (no form to save). Hidden when the site has no push keys.
 */
export function PushToggle({ publicKey, className }: { publicKey: string | null; className?: string }) {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    let live = true;
    void pushStatus().then((current) => {
      if (!live) return;
      setStatus(current);
      if (current === "on") void syncPush().catch(() => undefined);
    });
    return () => {
      live = false;
    };
  }, [publicKey]);

  if (!publicKey) return null;
  const on = status === "on";
  const usable = status === "on" || status === "off";

  async function toggle() {
    if (!publicKey || !usable) return;
    setBusy(true);
    setMessage(null);
    try {
      if (on) {
        await disablePush();
        setStatus("off");
      } else {
        const next = await enablePush(publicKey);
        setStatus(next);
        if (next === "on") setMessage({ ok: true, text: "Byakunze! Tuzakwibutsa kuri iyi telefoni." });
      }
    } catch (e) {
      // DOMException: the browser's push service refused (no Google services, private window, data saver...).
      const refused = e instanceof DOMException;
      setMessage({
        ok: false,
        text: refused
          ? "Iyi browser yanze kwakira imenyesha. Ongera ugerageze, cyangwa ukoreshe Chrome (atari mu idirishya ryihishe)."
          : errorMessage(e),
      });
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setMessage(null);
    try {
      const { sent } = await api<{ sent: number }>("/push/test", { method: "POST" });
      setMessage(
        sent
          ? { ok: true, text: "Twohereje imenyesha ry’igerageza. Reba kuri telefoni yawe." }
          : { ok: false, text: "Ntiryagezeyo. Zimya imenyesha, hanyuma wongere urifungure." },
      );
    } catch (e) {
      setMessage({ ok: false, text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-2xl border border-line p-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <span>
          <span className="flex items-center gap-2 font-semibold">
            <Smartphone className="size-4 text-brand-600 dark:text-brand-300" aria-hidden /> Nyibutsa kuri telefoni
          </span>
          <span className="mt-1 block text-sm text-muted">
            Imenyesha rigera kuri iyi telefoni buri mugoroba, niba utarageza ku ntego y’umunsi. Ni ubuntu.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Nyibutsa kuri telefoni"
          disabled={!usable || busy}
          onClick={toggle}
          className={cn(
            "relative mt-0.5 inline-flex h-7 w-12 shrink-0 rounded-full ring-1 ring-line transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 disabled:opacity-50",
            on ? "bg-brand-500" : "bg-surface-2",
          )}
        >
          <span
            className={cn(
              "absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-white shadow-soft transition",
              on && "translate-x-5",
            )}
          >
            {(busy || status === null) && <LoaderCircle className="size-3 animate-spin text-muted" aria-hidden />}
          </span>
        </button>
      </div>
      {status && NOTES[status] && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-sun-50 p-3 text-sm text-sun-800 dark:bg-sun-400/10 dark:text-sun-200">
          <BellRing className="mt-0.5 size-4 shrink-0" aria-hidden /> {NOTES[status]}
        </p>
      )}
      {on && (
        <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={test} disabled={busy}>
          <Send className="size-4" aria-hidden /> Ohereza igerageza
        </Button>
      )}
      {message && (
        <p role="status" className={cn("mt-2 text-sm font-semibold", message.ok ? "text-brand-600" : "text-signal-600")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
