"use client";

import { ArrowRight, LoaderCircle, LogIn, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Exam } from "@/lib/types";

export function ExamStartButton({
  signedIn,
  resumeId,
  size = "lg",
  variant = "primary",
  className,
}: {
  signedIn: boolean;
  resumeId?: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "sun" | "dark";
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <ButtonLink href="/injira?next=/ikizamini" size={size} variant={variant} className={className}>
        <LogIn className="size-5" /> Injira utangire ikizamini
      </ButtonLink>
    );
  }

  if (resumeId) {
    return (
      <ButtonLink href={`/ikizamini/${resumeId}`} size={size} variant="sun" className={className}>
        <Play className="size-5" /> Komeza ikizamini kitarangiye
      </ButtonLink>
    );
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const exam = await api<Exam>("/exams", { method: "POST" });
      router.push(`/ikizamini/${exam.id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button size={size} variant={variant} onClick={start} disabled={busy} className={className}>
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Play className="size-5" />}
        {busy ? "Turimo gutegura ikizamini..." : "Tangira ikizamini"}
        {!busy && <ArrowRight className="size-5" />}
      </Button>
      {error && <p className="text-sm font-medium text-signal-600">{error}</p>}
    </div>
  );
}
