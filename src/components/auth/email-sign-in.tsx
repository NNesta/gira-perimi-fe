"use client";

import { ArrowLeft, LoaderCircle, Mail, MailCheck, Send } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

const RESEND_SECONDS = 60;
const INPUT =
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

/**
 * "Injira ukoresheje imeyili": a one-time sign-in link sent by email, the way in for learners who cannot use the
 * Google button (a phone set up by its seller, whose Gmail opens but whose password nobody knows, or no Gmail at all).
 */
export function EmailSignIn({ next, startOpen = false }: { next?: string; startOpen?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(startOpen);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const address = email.trim();
      await api("/auth/email", { method: "POST", json: { email: address, name: name.trim() || null, next: next ?? null } });
      setSentTo(address);
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const errorBox = error && (
    <p
      role="alert"
      className="rounded-xl bg-signal-50 px-4 py-3 text-center text-sm font-medium text-signal-700 dark:bg-signal-500/10 dark:text-signal-200"
    >
      {error}
    </p>
  );

  if (sentTo) {
    return (
      <div role="status" className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/70 p-5 text-center dark:border-brand-400/25 dark:bg-brand-500/10">
        <MailCheck className="mx-auto size-9 text-brand-600 dark:text-brand-300" aria-hidden />
        <div>
          <p className="text-lg font-bold">Reba imeyili yawe</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Twohereje link yo kwinjira kuri <strong className="break-all text-ink">{sentTo}</strong>. Yifungure kuri
            telefoni cyangwa mudasobwa ushaka kwigiraho: ikora rimwe gusa, mu minota mike.
          </p>
          <p className="mt-2 text-xs text-muted">Ntuyibonye? Reba no muri Spam cyangwa Promotions.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button size="sm" variant="secondary" disabled={wait > 0 || busy} onClick={() => void send()}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {wait > 0 ? `Ohereza indi (${wait})` : "Ohereza indi"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSentTo(null);
              setWait(0);
              setError(null);
            }}
          >
            Hindura imeyili
          </Button>
        </div>
        {errorBox}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="text-center">
        <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
          <Mail className="size-4" /> Injira ukoresheje imeyili
        </Button>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Ku batazi ijambobanga rya Gmail yabo, cyangwa badafite Gmail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <label htmlFor={`${id}-email`} className="block">
        <span className="text-sm font-semibold text-muted">Imeyili yawe</span>
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="urugero@gmail.com"
          className={INPUT}
        />
      </label>
      <label htmlFor={`${id}-name`} className="block">
        <span className="text-sm font-semibold text-muted">
          Izina ryawe <span className="font-normal">(niba ari ubwa mbere)</span>
        </span>
        <input
          id={`${id}-name`}
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Urugero: Keza Uwase"
          className={INPUT}
        />
      </label>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        {busy ? "Turimo kohereza..." : "Nyoherereza link yo kwinjira"}
      </Button>
      <p className="text-center text-xs leading-relaxed text-muted">
        Nta jambobanga ukeneye: tukoherereza link, ukayikanda ukinjira.
      </p>
      {errorBox}
      {!startOpen && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden /> Subira inyuma
        </button>
      )}
    </form>
  );
}
