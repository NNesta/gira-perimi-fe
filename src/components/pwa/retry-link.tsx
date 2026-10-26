"use client";

import { RotateCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { safeNext } from "@/lib/redirect";

/** "Ongera ugerageze": goes back to the page the learner wanted (a full load, so it is fetched again). */
export function RetryLink() {
  const from = safeNext(useSearchParams().get("from"), "/");
  return (
    <a href={from} className={buttonStyles({ variant: "primary" })}>
      <RotateCw className="size-4" aria-hidden /> Ongera ugerageze
    </a>
  );
}
