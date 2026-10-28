"use client";

import confetti from "canvas-confetti";
import { BookOpen, GraduationCap, Heart, PartyPopper, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { PlanEditButton } from "@/components/plan/plan-edit-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { formatDayLong } from "@/lib/format";
import type { OutcomeResult, User } from "@/lib/types";

type Stage = "ask" | "passed" | "thanks" | "failed" | "not_taken";
const MAX_WORDS = 400;

/**
 * "Watsinze ikizamini?": asked on the dashboard once the learner's exam date has passed. The answer feeds the real
 * pass rate on the home page; learners who passed may leave a few words for others (published only if they agree
 * and an admin approves them).
 */
export function OutcomeQuestion({
  examDate,
  user,
  remindersAvailable,
  pushPublicKey,
}: {
  examDate: string;
  user: User;
  remindersAvailable: boolean;
  pushPublicKey: string | null;
}) {
  const router = useRouter();
  const wordsId = useId();
  const [stage, setStage] = useState<Stage>("ask");
  const [words, setWords] = useState("");
  const [share, setShare] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = user.given_name || user.name.split(" ")[0];

  async function send(result: OutcomeResult, extra?: { testimonial: string; public: boolean }): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      await api("/me/outcome", { method: "POST", json: { exam_date: examDate, result, ...extra } });
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function answer(result: OutcomeResult) {
    if (!(await send(result))) return;
    if (result === "passed" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors: ["#129b68", "#fad201", "#00a1de", "#ffffff"] });
    }
    setStage(result);
  }

  async function sendWords() {
    if (!words.trim()) return router.refresh();
    if (await send("passed", { testimonial: words, public: share })) setStage("thanks");
  }

  const newDate = (
    <div className="mt-5 flex flex-wrap gap-2">
      <PlanEditButton user={user} remindersAvailable={remindersAvailable} pushPublicKey={pushPublicKey} variant="set" />
      <Button variant="ghost" onClick={() => router.refresh()}>
        Nyuma
      </Button>
    </div>
  );

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl border border-sun-200 bg-gradient-to-br from-sun-50 via-surface to-brand-50 p-5 shadow-soft sm:p-7 dark:border-sun-300/20 dark:from-sun-400/10 dark:via-surface dark:to-brand-500/10"
    >
      {stage === "ask" && (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-300 text-asphalt shadow-soft">
            <GraduationCap className="size-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold">Watsinze ikizamini?</h2>
            <p className="mt-1.5 text-muted">
              Ikizamini cyawe cyari ku wa {formatDayLong(examDate)}. Tubwire uko byagenze: bidufasha kumenya niba Tsinda
              Neza ifasha abayikoresha koko.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => answer("passed")} disabled={busy}>
                <PartyPopper className="size-4" aria-hidden /> Yego, natsinze!
              </Button>
              <Button variant="secondary" onClick={() => answer("failed")} disabled={busy}>
                Oya, sinatsinze
              </Button>
              <Button variant="ghost" onClick={() => answer("not_taken")} disabled={busy}>
                Sinagikoze
              </Button>
            </div>
          </div>
        </div>
      )}

      {stage === "passed" && (
        <div>
          <h2 className="text-2xl font-extrabold">Twishimiye intsinzi yawe, {name}! 🎉</h2>
          <p className="mt-1.5 text-muted">
            Intambwe ikurikira ni ikizamini cyo gutwara. Wakwandikira abandi biga amagambo make ku byagufashije? Si ngombwa.
          </p>
          <label htmlFor={wordsId} className="sr-only">
            Amagambo yawe
          </label>
          <textarea
            id={wordsId}
            value={words}
            onChange={(e) => setWords(e.target.value.slice(0, MAX_WORDS))}
            rows={3}
            placeholder="Urugero: amasomo y’ibyapa n’ibizamini by’igerageza byamfashije kwitegura neza."
            className="mt-4 w-full resize-y rounded-2xl border border-line bg-surface p-3.5 text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
          />
          <div className="mt-1 text-right text-xs tabular-nums text-muted">
            {words.length}/{MAX_WORDS}
          </div>
          <label className="mt-2 flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-brand-600"
            />
            Nemera ko amagambo yanjye n’izina ryanjye rya mbere ({name}) bigaragara kuri Tsinda Neza.
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={sendWords} disabled={busy || !words.trim()}>
              <Send className="size-4" aria-hidden /> Ohereza
            </Button>
            <Button variant="ghost" onClick={() => router.refresh()} disabled={busy}>
              Oya, urakoze
            </Button>
          </div>
        </div>
      )}

      {stage === "thanks" && (
        <div className="flex items-start gap-4">
          <Heart className="mt-1 size-7 shrink-0 text-signal-500" aria-hidden />
          <div>
            <h2 className="text-2xl font-extrabold">Murakoze cyane!</h2>
            <p className="mt-1.5 text-muted">
              {share
                ? "Amagambo yawe azasomwa n’ubuyobozi mbere yo kugaragara ku rubuga."
                : "Amagambo yawe yatugezeho. Ntazagaragara ku rubuga, nk’uko wabihisemo."}
            </p>
            <Button className="mt-5" onClick={() => router.refresh()}>
              Funga
            </Button>
          </div>
        </div>
      )}

      {stage === "failed" && (
        <div>
          <h2 className="text-2xl font-extrabold">Ihangane, bizagenda neza ubutaha! 💪</h2>
          <p className="mt-1.5 text-muted">
            Benshi batsinda ku nshuro ya kabiri. Shyiraho itariki nshya, usubire ku byo wibeshyeho, ukomeze kwitegura.
          </p>
          <ButtonLink href="/imyitozo/amakosa" variant="soft" className="mt-4">
            <BookOpen className="size-4" aria-hidden /> Ibyo nibeshyeho
          </ButtonLink>
          {newDate}
        </div>
      )}

      {stage === "not_taken" && (
        <div>
          <h2 className="text-2xl font-extrabold">Nta kibazo.</h2>
          <p className="mt-1.5 text-muted">Shyiraho itariki nshya y’ikizamini, tugutegurire gahunda nshya.</p>
          {newDate}
        </div>
      )}

      {error && <p className="mt-4 text-sm font-semibold text-signal-600">{error}</p>}
    </section>
  );
}
