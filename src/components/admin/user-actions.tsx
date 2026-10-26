"use client";

import { Ban, Crown, UserRoundCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

/** Suspend / reactivate a learner and switch their plan (the plan matters once the paywall is on). */
export function UserActions({ userId, isActive, plan }: { userId: string; isActive: boolean; plan: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(changes: { is_active?: boolean; plan?: string }) {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/users/${userId}`, { method: "PATCH", json: changes });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => update({ is_active: !isActive })}>
          {isActive ? <Ban className="size-4" /> : <UserRoundCheck className="size-4" />}
          {isActive ? "Hagarika konti" : "Ongera ufungure konti"}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => update({ plan: plan === "premium" ? "free" : "premium" })}>
          <Crown className="size-4" /> {plan === "premium" ? "Subiza ku buntu" : "Ha ifatabuguzi"}
        </Button>
      </div>
      {error && <p className="text-sm font-medium text-signal-600">{error}</p>}
    </div>
  );
}
