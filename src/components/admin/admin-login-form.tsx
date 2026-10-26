"use client";

import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/admin/auth/login", { method: "POST", json: { email, password } });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-muted">Imeyili</span>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-surface px-4 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-muted">Ijambobanga</span>
        <span className="relative mt-1.5 block">
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-surface px-4 pr-12 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hisha ijambobanga" : "Garagaza ijambobanga"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-signal-50 px-4 py-3 text-sm font-medium text-signal-700 dark:bg-signal-500/10 dark:text-signal-200">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
        {busy ? "Turimo kugenzura..." : "Injira"}
      </Button>
    </form>
  );
}
