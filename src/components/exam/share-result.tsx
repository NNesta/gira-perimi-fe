"use client";
/* eslint-disable @next/next/no-img-element -- the card is a generated PNG */

import { Check, Download, Link2, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";

/**
 * "Sangiza abandi": the result card of a passed exam, ready for WhatsApp. The link opens a public page whose preview
 * is the card itself, so the picture shows in the chat even when only the link is sent.
 */
export function ShareResult({ examId, score, total, className }: { examId: string; score: number; total: number; className?: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    let live = true;
    api<{ code: string }>(`/exams/${examId}/share`, { method: "POST" })
      .then(({ code }) => live && setCode(code))
      .catch((e) => live && setError(errorMessage(e)));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection after hydration
    setCanShare(typeof navigator.share === "function");
    return () => {
      live = false;
    };
  }, [examId]);

  if (error) return null; // sharing is a bonus: never get in the way of the result
  const url = code ? `${window.location.origin}/natsinze/${code}` : "";
  const image = code ? `/natsinze/${code}/ifoto` : "";
  const text = `Nabonye ${score}/${total} mu kizamini cy’igerageza cy’amategeko y’umuhanda kuri Tsinda Neza! 🎉 Nawe witoze ku buntu:`;
  const fileName = `tsinda-neza-${score}-${total}.png`;

  async function shareImage() {
    try {
      const blob = await fetch(image).then((r) => r.blob());
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `${text} ${url}` });
      else await navigator.share({ text, url });
    } catch {
      // cancelled by the learner, or the share sheet failed: nothing to report
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked: the WhatsApp and share buttons still work
    }
  }

  return (
    <section className={cn("card overflow-hidden p-5 sm:p-7", className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
          {code ? (
            <img src={image} alt={`Nabonye ${score}/${total}`} width={1200} height={630} className="block h-auto w-full" />
          ) : (
            <Skeleton className="aspect-[1200/630] w-full rounded-none" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold">Sangiza abandi intsinzi yawe</h2>
          <p className="mt-2 text-muted">
            Ohereza ifoto y’amanota yawe ku nshuti n’umuryango, kuri WhatsApp cyangwa ahandi. Bazabona gusa izina ryawe rya
            mbere n’amanota.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a
              href={code ? `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!code}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 font-semibold text-[#08361c] shadow-soft transition hover:brightness-95",
                !code && "pointer-events-none opacity-55",
              )}
            >
              <MessageCircle className="size-5" aria-hidden /> Sangiza kuri WhatsApp
            </a>
            {canShare ? (
              <Button variant="secondary" onClick={shareImage} disabled={!code}>
                <Share2 className="size-4" /> Sangiza ifoto
              </Button>
            ) : (
              <a
                href={image || undefined}
                download={fileName}
                aria-disabled={!code}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-5 font-semibold shadow-soft transition hover:border-brand-300",
                  !code && "pointer-events-none opacity-55",
                )}
              >
                <Download className="size-4" aria-hidden /> Bika ifoto
              </a>
            )}
            <Button variant="ghost" onClick={copyLink} disabled={!code} className="sm:col-span-2">
              {copied ? <Check className="size-4 text-brand-600" /> : <Link2 className="size-4" />}
              {copied ? "Link yakoporowe" : "Koporora link"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
