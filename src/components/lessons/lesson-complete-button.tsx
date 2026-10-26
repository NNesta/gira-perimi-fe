"use client";

import { CircleCheckBig, LogIn, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

export function LessonCompleteButton({
  slug,
  completed,
  signedIn,
}: {
  slug: string;
  completed: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <ButtonLink href={`/injira?next=/amasomo/${slug}`} variant="secondary" size="lg">
        <LogIn className="size-5" /> Injira kugira ngo ubike aho ugeze
      </ButtonLink>
    );
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      await api(`/me/lessons/${slug}`, { method: done ? "DELETE" : "PUT" });
      setDone(!done);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {done ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-5 py-3 font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <PartyPopper className="size-5" /> Wararirangije!
          </span>
          <Button variant="ghost" size="sm" onClick={toggle} disabled={busy}>
            Kuraho ikimenyetso
          </Button>
        </div>
      ) : (
        <Button size="lg" onClick={toggle} disabled={busy}>
          <CircleCheckBig className="size-5" /> {busy ? "Biratunganywa..." : "Narangije iri somo"}
        </Button>
      )}
      {error && <p className="text-sm text-signal-600">{error}</p>}
    </div>
  );
}
