"use client";

import { CalendarPlus, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StudySettingsForm } from "@/components/plan/study-settings-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { User } from "@/lib/types";

/** Opens the study settings (exam date, goal, reminders) from the dashboard. */
export function PlanEditButton({
  user,
  remindersAvailable,
  variant = "edit",
}: {
  user: Pick<User, "exam_date" | "daily_goal" | "reminders">;
  remindersAvailable: boolean;
  variant?: "set" | "edit";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "set" ? (
        <Button variant="sun" onClick={() => setOpen(true)}>
          <CalendarPlus className="size-4" aria-hidden /> Shyiraho itariki
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/25"
        >
          <PencilLine className="size-4" aria-hidden /> Hindura
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Gahunda yawe yo kwiga"
        description="Itariki y’ikizamini n’intego ya buri munsi bigufasha kwiga buhoro buhoro, nta guhubuka."
      >
        <StudySettingsForm
          user={user}
          remindersAvailable={remindersAvailable}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Dialog>
    </>
  );
}
