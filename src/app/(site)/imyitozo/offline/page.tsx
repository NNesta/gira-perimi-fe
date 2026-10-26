import type { Metadata } from "next";
import { Suspense } from "react";

import { OfflinePractice } from "@/components/practice/offline-practice";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Imyitozo nta interineti", robots: { index: false, follow: false } };

/** Practice from the copy saved on this device. Static, so the service worker can serve it without a connection. */
export default function OfflinePracticePage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="card mx-auto max-w-3xl space-y-4 p-8">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        }
      >
        <OfflinePractice />
      </Suspense>
    </div>
  );
}
