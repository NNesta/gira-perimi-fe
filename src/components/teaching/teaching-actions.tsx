"use client";

import { Archive, ArchiveRestore, Check, Link2, MessageCircle, Plus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await task();
      router.refresh();
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}

export function NewClassForm({ schoolId }: { schoolId: string }) {
  const [name, setName] = useState("");
  const { busy, error, run } = useAction();
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const made = await run(() => api(`/teaching/schools/${schoolId}/classes`, { method: "POST", json: { name } }));
        if (made) setName("");
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
        maxLength={80}
        placeholder="Izina ry’itsinda rishya (urugero: Itsinda rya mu gitondo)"
        aria-label="Izina ry’itsinda rishya"
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
      />
      <Button type="submit" disabled={busy} className="shrink-0">
        <Plus className="size-4" /> Kora itsinda
      </Button>
      {error && <p className="text-sm font-semibold text-signal-600">{error}</p>}
    </form>
  );
}

/** The join code, big enough to read out loud, with a link for WhatsApp. */
export function ClassCodeShare({ code, className, school }: { code: string; className: string; school: string }) {
  const [copied, setCopied] = useState(false);
  const link = () => `${window.location.origin}/ishuri/${code}`;
  const text = () =>
    `Injira mu itsinda “${className}” rya ${school} kuri Tsinda Neza, wige amategeko y’umuhanda: ${link()} (kode: ${code})`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-xl bg-surface-2 px-3 py-1.5 font-display text-xl font-extrabold tracking-[0.2em]">{code}</span>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          window.open(`https://wa.me/?text=${encodeURIComponent(text())}`, "_blank", "noreferrer");
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#25d366] px-3 text-sm font-semibold text-[#08361c]"
      >
        <MessageCircle className="size-4" aria-hidden /> WhatsApp
      </a>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link());
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            // clipboard blocked: the code can still be read out
          }
        }}
      >
        {copied ? <Check className="size-4 text-brand-600" /> : <Link2 className="size-4" />}
        {copied ? "Yakoporowe" : "Koporora link"}
      </Button>
    </div>
  );
}

export function ArchiveClassButton({ classId, archived }: { classId: string; archived: boolean }) {
  const { busy, error, run } = useAction();
  return (
    <span className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="secondary"
        disabled={busy}
        onClick={() => void run(() => api(`/teaching/classes/${classId}`, { method: "PATCH", json: { archived: !archived } }))}
      >
        {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        {archived ? "Rifungure" : "Ribike (rifunge)"}
      </Button>
      {error && <span className="text-xs font-semibold text-signal-600">{error}</span>}
    </span>
  );
}

export function RemoveLearnerButton({ classId, userId, name }: { classId: string; userId: string; name: string }) {
  const { busy, run } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      aria-label={`Kura ${name} mu itsinda`}
      title="Kura mu itsinda"
      disabled={busy}
      onClick={() => {
        if (window.confirm(`Ukuye ${name} muri iri tsinda? Ntuzongera kubona aho ageze.`)) {
          void run(() => api(`/teaching/classes/${classId}/learners/${userId}`, { method: "DELETE" }));
        }
      }}
    >
      <UserMinus className="size-4" />
    </Button>
  );
}
