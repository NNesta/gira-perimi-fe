"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { reportError } from "@/lib/report-error";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error), [error]);
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16">
      <div className="card max-w-lg p-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-sun-100 text-sun-700">
          <TriangleAlert className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold">Habaye ikibazo</h1>
        <p className="mt-3 text-muted">
          Ntitwashoboye gufungura uru rupapuro. Bishobora guterwa n’interineti cyangwa seriveri iri kuvugururwa.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="size-4" /> Ongera ugerageze
          </Button>
          <ButtonLink href="/" variant="secondary">
            Ahabanza
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
