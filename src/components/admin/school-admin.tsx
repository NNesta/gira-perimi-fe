"use client";

import { MailPlus, Plus, Power, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { AdminSchool } from "@/lib/types";

const INPUT =
  "h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

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

export function NewSchoolForm() {
  const [name, setName] = useState("");
  const { busy, error, run } = useAction();
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (await run(() => api("/admin/schools", { method: "POST", json: { name } }))) setName("");
      }}
      className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
    >
      <label className="block flex-1">
        <span className="text-sm font-semibold text-muted">Ishuri rishya ryigisha gutwara</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={120}
          placeholder="Urugero: Auto-École Kigali"
          className={`mt-1.5 ${INPUT}`}
        />
      </label>
      <Button type="submit" disabled={busy}>
        <Plus className="size-4" /> Ongeraho
      </Button>
      {error && <p className="text-sm font-semibold text-signal-600">{error}</p>}
    </form>
  );
}

/** One school: its instructors (by email: whoever signs in with it teaches there), and opening or closing it. */
export function SchoolCard({ school }: { school: AdminSchool }) {
  const [email, setEmail] = useState("");
  const { busy, error, run } = useAction();
  const base = `/admin/schools/${school.id}`;
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{school.name}</h2>
          <p className="mt-0.5 text-sm text-muted">
            Kuva {formatDate(school.created_at)} · amatsinda {school.classes} · abanyeshuri {school.learners}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!school.active && <Badge tone="signal">Ryafunzwe</Badge>}
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void run(() => api(base, { method: "PATCH", json: { active: !school.active } }))}
          >
            <Power className="size-4" /> {school.active ? "Rifunge" : "Rifungure"}
          </Button>
        </div>
      </div>

      <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-muted">Abarimu</h3>
      {school.instructors.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nta mwarimu urongerwaho.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {school.instructors.map((instructor) => (
            <li key={instructor.id} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{instructor.name ?? instructor.email}</span>
                <span className="block truncate text-xs text-muted">
                  {instructor.name ? instructor.email : "Ntarinjira kuri Tsinda Neza"}
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Kuramo ${instructor.email}`}
                disabled={busy}
                onClick={() => void run(() => api(`${base}/instructors/${instructor.id}`, { method: "DELETE" }))}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const added = await run(() => api(`${base}/instructors`, { method: "POST", json: { email } }));
          if (added) setEmail("");
        }}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="imeyili y’umwarimu"
          aria-label="Imeyili y’umwarimu"
          className={INPUT}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={busy} className="shrink-0">
          <MailPlus className="size-4" /> Ongeraho umwarimu
        </Button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-signal-600">{error}</p>}
    </section>
  );
}
