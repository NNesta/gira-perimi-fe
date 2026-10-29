"use client";

import { ArrowRight, CircleCheck, LoaderCircle, LogOut, School, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { MyClass } from "@/lib/types";

/** Joins with a code, once the learner has agreed that the school's instructors see their progress. */
export function JoinClassButton({ code }: { code: string }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
          <CircleCheck className="size-5" /> Winjiye mu itsinda!
        </p>
        <ButtonLink href="/ikibaho">
          Komeza wige <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-brand-600"
        />
        <span>
          Nemeye ko abarimu b’iri shuri babona aho ngeze: amanota y’ibizamini by’igerageza, ibice nkomeyemo n’ibyo
          nkeneye kongeramo imbaraga, n’igihe nize bwa nyuma. Nshobora kuva mu itsinda igihe cyose.
        </span>
      </label>
      <Button
        size="lg"
        className="w-full"
        disabled={!agreed || busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await api("/classes/join", { method: "POST", json: { code } });
            setJoined(true);
          } catch (e) {
            setError(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Users className="size-5" />} Injira mu itsinda
      </Button>
      {error && <p className="text-center text-sm font-medium text-signal-700 dark:text-signal-300">{error}</p>}
    </div>
  );
}

/** Profile card: the classes the learner is in (leave any time), and joining one with a code. */
export function MyClassesCard({ classes }: { classes: MyClass[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [leaving, setLeaving] = useState<string | null>(null);

  return (
    <section className="card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <School className="size-5 text-muted" aria-hidden /> Ishuri ryigisha gutwara
        </h2>
        <p className="mt-1 text-sm text-muted">
          Wiga mu ishuri ryigisha gutwara? Injira mu itsinda ryawe ukoresheje kode mwarimu yaguhaye, kugira ngo abone aho
          ugeze akagufasha.
        </p>
      </div>
      {classes.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {classes.map((klass) => (
            <li key={klass.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{klass.name}</span>
                <span className="block truncate text-sm text-muted">{klass.school}</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={leaving === klass.id}
                onClick={async () => {
                  if (!window.confirm(`Uvuye mu itsinda “${klass.name}”? Abarimu baryo ntibazongera kubona aho ugeze.`)) return;
                  setLeaving(klass.id);
                  await api(`/me/classes/${klass.id}`, { method: "DELETE" }).catch(() => undefined);
                  setLeaving(null);
                  router.refresh();
                }}
              >
                <LogOut className="size-4" /> Rivemo
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const clean = code.replace(/[^a-z0-9]/gi, "").toUpperCase();
          if (clean) router.push(`/ishuri/${clean}`);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode y’itsinda (urugero: K7M2QX)"
          aria-label="Kode y’itsinda"
          autoCapitalize="characters"
          className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 uppercase tracking-widest outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Komeza <ArrowRight className="size-4" />
        </Button>
      </form>
    </section>
  );
}
