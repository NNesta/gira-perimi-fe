"use client";

import { BadgeCheck, Download, Share, SquarePlus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { promptInstall, readInstallState, subscribeInstall } from "@/lib/pwa";

/** "Shyira kuri telefone": installs the site as an app (Android/Chrome prompt, or the iPhone steps). */
export function InstallAppButton({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribeInstall, readInstallState, () => "unavailable" as const);
  const [iosHelp, setIosHelp] = useState(false);

  if (state === "installed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
        <BadgeCheck className="size-4" aria-hidden /> Gira Perimi iri kuri iki gikoresho
      </span>
    );
  }
  if (state === "unavailable") return null;

  return (
    <>
      <Button
        variant="secondary"
        className={className}
        onClick={() => (state === "prompt" ? void promptInstall() : setIosHelp(true))}
      >
        <Download className="size-4" aria-hidden /> Shyira kuri telefone
      </Button>
      <Dialog
        open={iosHelp}
        onClose={() => setIosHelp(false)}
        title="Shyira Gira Perimi kuri iPhone"
        description="Mu ntambwe ebyiri, Gira Perimi iboneka kuri telefone yawe nk’izindi porogaramu."
        size="sm"
      >
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ocean-50 text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-300">
              <Share className="size-5" aria-hidden />
            </span>
            <span className="pt-1.5">
              Muri Safari, kanda akabuto <strong>Share</strong> (kari hasi cyangwa hejuru).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ocean-50 text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-300">
              <SquarePlus className="size-5" aria-hidden />
            </span>
            <span className="pt-1.5">
              Hitamo <strong>Add to Home Screen</strong>, hanyuma <strong>Add</strong>.
            </span>
          </li>
        </ol>
        <Button className="mt-6 w-full" onClick={() => setIosHelp(false)}>
          Nabyumvise
        </Button>
      </Dialog>
    </>
  );
}
