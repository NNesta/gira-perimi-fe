"use client";

import { LoaderCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Exam } from "@/lib/types";

/** Starts the learner's exam on the friend's paper (or reopens it) and goes to it. */
export function ChallengeStart({ code, label }: { code: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const exam = await api<Exam>(`/challenges/${encodeURIComponent(code)}/start`, { method: "POST" });
      router.push(`/ikizamini/${exam.id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button size="lg" onClick={() => void start()} disabled={busy} className="w-full sm:w-auto">
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Play className="size-5" />}
        {busy ? "Turimo gutegura ikizamini..." : label}
      </Button>
      {error && (
        <p role="alert" className="text-center text-sm font-medium text-signal-700 dark:text-signal-300">
          {error}
        </p>
      )}
    </div>
  );
}
