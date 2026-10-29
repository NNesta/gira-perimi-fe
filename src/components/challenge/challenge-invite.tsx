"use client";

import { Check, Link2, MessageCircle, Share2, Swords } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

/**
 * "Hangana n’inshuti": sends a finished exam's 20 questions to friends, who sit the same paper under the same rules
 * and see who did best. The link is made once per exam.
 */
export function ChallengeInvite({
  examId,
  score,
  total,
  className,
}: {
  examId: string;
  score: number;
  total: number;
  className?: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Feature detection after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function link(): Promise<string | null> {
    if (code) return `${window.location.origin}/hangana/${code}`;
    try {
      const made = await api<{ code: string }>(`/exams/${examId}/challenge`, { method: "POST" });
      setCode(made.code);
      return `${window.location.origin}/hangana/${made.code}`;
    } catch {
      setFailed(true);
      return null;
    }
  }

  const text = `Nabonye ${score}/${total} mu kizamini cy’igerageza cy’amategeko y’umuhanda. Ese wowe wabona angahe kuri ibi bibazo ${total}? Hangana nanjye kuri Tsinda Neza:`;

  async function whatsapp() {
    // Opened before the link is known, so the browser does not block it as a pop-up.
    const tab = window.open("", "_blank");
    const url = await link();
    if (!url) return tab?.close();
    const target = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    if (tab) tab.location.href = target;
    else window.location.href = target;
  }

  async function share() {
    const url = await link();
    if (url) await navigator.share({ text, url }).catch(() => undefined);
  }

  async function copy() {
    const url = await link();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked: WhatsApp and the share sheet still work
    }
  }

  if (failed) return null; // a bonus: never in the way of the result
  return (
    <section className={cn("card relative overflow-hidden p-5 sm:p-7", className)}>
      <div aria-hidden className="absolute -right-12 -top-12 size-44 rounded-full bg-sun-300/25 blur-2xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-300 text-asphalt shadow-soft">
          <Swords className="size-7" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">Hangana n’inshuti zawe</h2>
          <p className="mt-1 text-muted">
            Bohereze ibi bibazo {total} wakoze. Bazabikora mu minota 20, nk’uko nawe wabikoze, maze murebe uwatsinze
            abandi.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void whatsapp()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 font-semibold text-[#08361c] shadow-soft transition hover:brightness-95"
          >
            <MessageCircle className="size-5" aria-hidden /> WhatsApp
          </button>
          {canShare && (
            <Button variant="secondary" onClick={() => void share()}>
              <Share2 className="size-4" /> Sangiza
            </Button>
          )}
          <Button variant="ghost" onClick={() => void copy()}>
            {copied ? <Check className="size-4 text-brand-600" /> : <Link2 className="size-4" />}
            {copied ? "Yakoporowe" : "Koporora link"}
          </Button>
        </div>
      </div>
    </section>
  );
}
