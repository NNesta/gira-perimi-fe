"use client";

import { Check, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { TestimonialStatus } from "@/lib/types";

/** Approve (show on the home page, if the learner agreed) or hide a testimonial. */
export function TestimonialActions({ id, status }: { id: string; status: TestimonialStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function set(next: "approved" | "hidden") {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/testimonials/${id}`, { method: "PATCH", json: { status: next } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      {status !== "approved" && (
        <Button size="sm" onClick={() => set("approved")} disabled={busy}>
          <Check className="size-4" aria-hidden /> Emeza
        </Button>
      )}
      {status !== "hidden" && (
        <Button size="sm" variant="secondary" onClick={() => set("hidden")} disabled={busy}>
          <EyeOff className="size-4" aria-hidden /> Hisha
        </Button>
      )}
      {error && <span className="text-xs font-semibold text-signal-600">{error}</span>}
    </span>
  );
}
