import type { Metadata } from "next";
import { Suspense } from "react";

import { UnsubscribeCard } from "@/components/plan/unsubscribe-card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Hagarika kwibutswa", robots: { index: false, follow: false } };

/** Linked from reminder emails. Asks for one click so email scanners that open links cannot unsubscribe anyone. */
export default function UnsubscribePage() {
  return (
    <section className="container-page grid min-h-[70dvh] place-items-center py-14">
      <Suspense fallback={<Skeleton className="h-72 w-full max-w-md rounded-3xl" />}>
        <UnsubscribeCard />
      </Suspense>
    </section>
  );
}
