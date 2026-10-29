"use client";

import { LogOut, MonitorSmartphone, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StudySettingsForm } from "@/components/plan/study-settings-form";
import { OfflineCard } from "@/components/pwa/offline-card";
import { ThemeSegmented } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api, errorMessage } from "@/lib/api";
import { leaveSession } from "@/lib/redirect";
import type { User } from "@/lib/types";

const CONFIRM_WORD = "SIBA";

export function ProfileForm({
  user,
  remindersAvailable,
  pushPublicKey = null,
}: {
  user: User;
  remindersAvailable: boolean;
  pushPublicKey?: string | null;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState(user.phone ?? "");
  // Accounts opened with an email link have no Google profile: their name is theirs to set.
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [leavingAll, setLeavingAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const changes = user.google_account ? {} : { name: name.trim() };
      await api("/me", { method: "PATCH", json: { ...changes, phone: phone.trim() || null } });
      setStatus({ ok: true, text: "Byabitswe neza." });
      router.refresh();
    } catch (e) {
      setStatus({ ok: false, text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    await leaveSession();
  }

  async function logoutEverywhere() {
    setLeavingAll(true);
    try {
      await api("/auth/logout-all", { method: "POST" });
      await leaveSession();
    } catch (e) {
      setStatus({ ok: false, text: errorMessage(e) });
      setLeavingAll(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api("/me", { method: "DELETE" });
      await leaveSession();
    } catch (e) {
      setStatus({ ok: false, text: errorMessage(e) });
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Amakuru yawe</h2>
          <p className="mt-1 text-sm text-muted">
            {user.google_account
              ? "Izina, imeyili n’ifoto biva kuri konti yawe ya Google."
              : "Winjira ukoresheje link twohereza kuri iyi meyili. Ushobora guhindura izina ryawe."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-muted">Amazina</span>
            {user.google_account ? (
              <input value={user.name} readOnly className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-ink-soft" />
            ) : (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
              />
            )}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-muted">Imeyili</span>
            <input value={user.email} readOnly className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-ink-soft" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-muted">Nimero ya telefone (si ngombwa)</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 7xx xxx xxx"
              pattern="^\+?[0-9 ]{9,20}$"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
            <span className="mt-1.5 block text-xs text-muted">Izadufasha kukumenyesha amakuru y’ingenzi, nk’igihe ifatabuguzi rizatangira.</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            <Save className="size-4" /> {saving ? "Birabikwa..." : "Bika"}
          </Button>
          {status && <p className={status.ok ? "text-sm font-semibold text-brand-600" : "text-sm font-semibold text-signal-600"}>{status.text}</p>}
        </div>
      </form>

      <section className="card space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Gahunda yo kwiga</h2>
          <p className="mt-1 text-sm text-muted">
            Itariki y’ikizamini n’intego ya buri munsi bigaragara ku kibaho cyawe nka gahunda y’uyu munsi.
          </p>
        </div>
        <StudySettingsForm
          user={user}
          remindersAvailable={remindersAvailable}
          pushPublicKey={pushPublicKey}
          onSaved={() => router.refresh()}
        />
      </section>

      <OfflineCard uid={user.id} />

      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Amabara y’urubuga</h2>
          <p className="mt-1 text-sm text-muted">Sisitemu ikurikiza igikoresho cyawe; ushobora no guhitamo umucyo cyangwa umwijima.</p>
        </div>
        <ThemeSegmented className="shrink-0" />
      </div>

      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Sohoka</h2>
          <p className="mt-1 text-sm text-muted">
            Ibyo wakoze byose bigumaho; uzongera winjire ukoresheje Gmail cyangwa imeyili yawe. Niba warinjiriye kuri
            telefoni cyangwa mudasobwa y’undi, sohoka kuri byose icyarimwe.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button variant="secondary" onClick={logout}>
            <LogOut className="size-4" /> Sohoka
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void logoutEverywhere()} disabled={leavingAll}>
            <MonitorSmartphone className="size-4" /> {leavingAll ? "Urasohoka..." : "Sohoka ku bikoresho byose"}
          </Button>
        </div>
      </div>

      <div className="card flex flex-col gap-4 border-signal-200 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-signal-400/30">
        <div>
          <h2 className="text-lg font-bold text-signal-700 dark:text-signal-400">Siba konti yanjye</h2>
          <p className="mt-1 text-sm text-muted">Bisiba burundu konti yawe, ibizamini, imyitozo n’amasomo warangije.</p>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" /> Siba konti
        </Button>
      </div>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Urashaka gusiba konti yawe burundu?"
        description={
          <span>
            Ibi ntibisubirwaho. Andika <strong className="text-ink">{CONFIRM_WORD}</strong> kugira ngo wemeze.
          </span>
        }
        size="sm"
      >
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-label={`Andika ${CONFIRM_WORD}`}
          className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none focus:border-signal-400 focus:ring-4 focus:ring-signal-500/15"
        />
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Reka
          </Button>
          <Button variant="danger" disabled={confirm.trim().toUpperCase() !== CONFIRM_WORD || deleting} onClick={remove}>
            <Trash2 className="size-4" /> {deleting ? "Birasibwa..." : "Siba burundu"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
