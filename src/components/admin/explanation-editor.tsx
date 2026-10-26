"use client";

import { BadgeCheck, LoaderCircle, PencilLine, RotateCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api, errorMessage } from "@/lib/api";
import type { AdminQuestion } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];
const MAX_LENGTH = 2000;

function save(question: AdminQuestion, body: { explanation: string; law_ref: string | null; reviewed: boolean }) {
  return api<AdminQuestion>(`/admin/questions/${question.id}/explanation`, { method: "PUT", json: body });
}

/** One click: confirms the current explanation as reviewed. */
export function ApproveExplanationButton({ question }: { question: AdminQuestion }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (question.reviewed || !question.explanation) return null;
  return (
    <Button
      variant="soft"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await save(question, { explanation: question.explanation ?? "", law_ref: question.law_ref, reviewed: true });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <BadgeCheck className="size-4" aria-hidden />}
      Emeza
    </Button>
  );
}

/** Edit dialog: explanation text, the article of law it rests on, and the "reviewed" mark. */
export function ExplanationEditor({ question }: { question: AdminQuestion }) {
  const router = useRouter();
  const textId = useId();
  const lawId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(question.explanation ?? "");
  const [law, setLaw] = useState(question.law_ref ?? "");
  const [reviewed, setReviewed] = useState(question.reviewed);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setText(question.explanation ?? "");
    setLaw(question.law_ref ?? "");
    setReviewed(question.reviewed || !question.edited);
    setError(null);
    setOpen(true);
  }

  async function run(kind: "save" | "reset") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "save") await save(question, { explanation: text, law_ref: law.trim() || null, reviewed });
      else await api(`/admin/questions/${question.id}/explanation`, { method: "DELETE" });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const answer = question.options[question.answer];
  return (
    <>
      <Button variant="secondary" size="sm" onClick={openEditor}>
        <PencilLine className="size-4" aria-hidden /> Hindura
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Ikibazo cya ${question.ref}`} size="lg">
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="font-semibold">{question.text}</p>
            <p className="mt-2 text-sm text-brand-700 dark:text-brand-300">
              Igisubizo cy’ukuri: {LETTERS[question.answer]}) {answer?.text || "(ishusho)"}
            </p>
          </div>
          <label htmlFor={textId} className="block">
            <span className="flex items-baseline justify-between text-sm font-semibold text-muted">
              Igisobanuro (impamvu igisubizo ari cyo)
              <span className="text-xs font-normal tabular-nums">
                {text.length}/{MAX_LENGTH}
              </span>
            </span>
            <textarea
              id={textId}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              rows={5}
              placeholder="Andika mu magambo make impamvu iki gisubizo ari cyo…"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-3 leading-relaxed outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
            <span className="mt-1 block text-xs text-muted">Ukirekeye ubusa, abanyeshuri ntibazabona igisobanuro kuri iki kibazo.</span>
          </label>
          <label htmlFor={lawId} className="block">
            <span className="text-sm font-semibold text-muted">Ingingo y’itegeko (si ngombwa)</span>
            <input
              id={lawId}
              value={law}
              onChange={(e) => setLaw(e.target.value.slice(0, 200))}
              placeholder="Urugero: Iteka rya Perezida n° 85/01, ingingo ya 24"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              className="size-5 rounded accent-brand-600"
            />
            <span className="font-semibold">Nasuzumye iki gisobanuro, ni cyo</span>
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-signal-50 px-4 py-3 text-sm font-medium text-signal-700 dark:bg-signal-500/10 dark:text-signal-200">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {question.edited ? (
              <Button variant="ghost" onClick={() => run("reset")} disabled={busy !== null}>
                {busy === "reset" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
                Garura icy’ibanze
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Reka
              </Button>
              <Button onClick={() => run("save")} disabled={busy !== null}>
                {busy === "save" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
                Bika
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
