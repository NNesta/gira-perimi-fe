"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { afterSignIn } from "@/lib/redirect";
import type { User } from "@/lib/types";

/**
 * The page a sign-in link opens. Signing in waits for a tap: mail scanners open links by themselves, and would
 * otherwise use up a link that works only once.
 */
export function EmailLinkConfirm({ token, next }: { token: string; next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    token.length >= 20 ? null : "Iyi link ntiyuzuye. Saba indi, hanyuma uyifungure yose uko yakabaye.",
  );

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const user = await api<User>("/auth/email/verify", { method: "POST", json: { token } });
      router.replace(afterSignIn(user, next));
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div role="alert" className="mt-4">
        <p className="leading-relaxed text-muted">{error}</p>
        <ButtonLink href={next ? `/injira?next=${encodeURIComponent(next)}` : "/injira"} className="mt-8 w-full">
          Saba indi link
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <p className="mt-3 leading-relaxed text-muted">Kanda hano hasi kugira ngo winjire kuri Tsinda Neza.</p>
      <Button size="lg" className="mt-8 w-full" onClick={() => void confirm()} disabled={busy}>
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <LogIn className="size-5" />}
        {busy ? "Turimo kukwinjiza..." : "Injira"}
      </Button>
    </>
  );
}
