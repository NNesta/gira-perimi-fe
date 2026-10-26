"use client";

import { BellRing, CalendarDays, Save, Target } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { kigaliToday } from "@/lib/format";
import type { User } from "@/lib/types";

const GOALS = [10, 20, 30, 50];

type Settings = Pick<User, "exam_date" | "daily_goal" | "reminders">;

/** Exam date, daily question goal and (when the site can send email) daily reminders. */
export function StudySettingsForm({
  user,
  remindersAvailable,
  onSaved,
}: {
  user: Settings;
  remindersAvailable: boolean;
  onSaved?: (user: User) => void;
}) {
  const dateId = useId();
  const [examDate, setExamDate] = useState(user.exam_date ?? "");
  const [goal, setGoal] = useState(user.daily_goal);
  const [reminders, setReminders] = useState(user.reminders);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const goals = GOALS.includes(user.daily_goal) ? GOALS : [...GOALS, user.daily_goal].sort((a, b) => a - b);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const json: Partial<Settings> = { exam_date: examDate || null, daily_goal: goal };
      if (remindersAvailable) json.reminders = reminders;
      const saved = await api<User>("/me", { method: "PATCH", json });
      setStatus({ ok: true, text: "Byabitswe neza." });
      onSaved?.(saved);
    } catch (e) {
      setStatus({ ok: false, text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <label htmlFor={dateId} className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CalendarDays className="size-4" aria-hidden /> Itariki y’ikizamini cyawe nyirizina
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <input
            id={dateId}
            type="date"
            value={examDate}
            min={kigaliToday()}
            max={kigaliToday(730)}
            onChange={(e) => setExamDate(e.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-3.5 text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
          />
          {examDate && (
            <button
              type="button"
              onClick={() => setExamDate("")}
              className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Siba itariki
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">Tuyikoresha kugutegurira gahunda: iminsi isigaye n’ibizamini ukwiye gukora.</p>
      </div>

      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Target className="size-4" aria-hidden /> Intego ya buri munsi
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {goals.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGoal(n)}
              aria-pressed={goal === n}
              className={cn(
                "h-11 rounded-xl border-2 px-4 text-sm font-bold transition",
                goal === n ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface hover:border-brand-300",
              )}
            >
              Ibibazo {n}
            </button>
          ))}
        </div>
      </fieldset>

      {remindersAvailable && (
        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line p-4">
          <span>
            <span className="flex items-center gap-2 font-semibold">
              <BellRing className="size-4 text-sun-600 dark:text-sun-300" aria-hidden /> Nyibutsa kuri imeyili
            </span>
            <span className="mt-1 block text-sm text-muted">
              Buri mugoroba, niba utarageza ku ntego yawe y’uwo munsi. Ushobora kubihagarika igihe icyo ari cyo cyose.
            </span>
          </span>
          <span className="relative mt-0.5 inline-flex shrink-0">
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="peer sr-only"
            />
            <span className="h-7 w-12 rounded-full bg-surface-2 ring-1 ring-line transition peer-checked:bg-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25" />
            <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow-soft transition peer-checked:translate-x-5" />
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="size-4" aria-hidden /> {saving ? "Birabikwa..." : "Bika gahunda"}
        </Button>
        {status && (
          <p role="status" className={status.ok ? "text-sm font-semibold text-brand-600" : "text-sm font-semibold text-signal-600"}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}
