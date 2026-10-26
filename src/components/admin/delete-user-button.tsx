"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api, errorMessage } from "@/lib/api";

export function DeleteUserButton({
  userId,
  name,
  email,
  redirectTo,
  compact = false,
}: {
  userId: string;
  name: string;
  email: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/users/${userId}`, { method: "DELETE" });
      setOpen(false);
      if (redirectTo) router.replace(redirectTo);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Siba ${name}`}
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10"
        >
          <Trash2 className="size-4" />
        </button>
      ) : (
        <Button variant="danger" onClick={() => setOpen(true)}>
          <Trash2 className="size-4" /> Siba umunyeshuri
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Gusiba uyu munyeshuri?"
        description={
          <span>
            <strong className="text-ink">{name}</strong> ({email}) azasibwa burundu, hamwe n’ibizamini bye, imyitozo n’amasomo
            yarangije. Ibi ntibisubirwaho.
          </span>
        }
        size="sm"
      >
        {error && <p className="mb-4 text-sm font-medium text-signal-600">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Reka
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            <Trash2 className="size-4" /> {busy ? "Birasibwa..." : "Yego, siba"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
