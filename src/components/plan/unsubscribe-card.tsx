"use client";

import { BellOff, CircleCheck, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

export function UnsubscribeCard() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setState("busy");
    setError(null);
    try {
      await api(`/reminders/unsubscribe?token=${encodeURIComponent(token)}`, { method: "POST" });
      setState("done");
    } catch (e) {
      setError(errorMessage(e));
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="card w-full max-w-md p-8 text-center sm:p-10">
        <CircleCheck className="mx-auto size-12 text-brand-500" aria-hidden />
        <h1 className="mt-5 text-2xl font-extrabold">Ntuzongera kwibutswa</h1>
        <p className="mt-3 text-muted">Ushobora kongera kubisaba igihe icyo ari cyo cyose mu mwirondoro wawe.</p>
        <ButtonLink href="/ikibaho" className="mt-7">
          Ikibaho cyanjye
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md p-8 text-center sm:p-10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-sun-100 text-sun-700 dark:bg-sun-400/15 dark:text-sun-300">
        <BellOff className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">Hagarika kwibutswa kuri imeyili?</h1>
      <p className="mt-3 text-muted">Ntuzongera kubona imeyili zikwibutsa kwiga buri mugoroba.</p>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-signal-50 px-4 py-3 text-sm font-medium text-signal-700 dark:bg-signal-500/10 dark:text-signal-200">
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={confirm} disabled={!token || state === "busy"}>
          {state === "busy" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <BellOff className="size-4" aria-hidden />}
          Yego, hagarika
        </Button>
        <ButtonLink href="/" variant="secondary">
          Oya, ubireke
        </ButtonLink>
      </div>
    </div>
  );
}
