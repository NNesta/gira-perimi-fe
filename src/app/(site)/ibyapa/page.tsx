import type { Metadata } from "next";
import { Suspense } from "react";

import { SignsExplorer } from "@/components/signs/signs-explorer";
import { PageHeader } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/api-server";
import type { Sign, SignCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ibyapa byo ku muhanda",
  description:
    "Ibyapa byose byo ku muhanda mu Rwanda: biburira, bibuza, bitegeka, biyobora, utwapa nyongera n’imirongo yo mu muhanda, n’ibisobanuro byabyo mu Kinyarwanda.",
};

async function Signs() {
  const data = await serverFetch<{ categories: SignCategory[]; signs: Sign[] }>("/signs");
  return <SignsExplorer categories={data.categories} signs={data.signs} />;
}

function SignsSkeleton() {
  return (
    <div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function SignsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ibyapa byo ku muhanda"
        title="Menya buri cyapa n’icyo kigusaba"
        description="Ibyapa n’ibimenyetso 166 byo mu iteka rigenga umuhanda, bigabanyijemo ibyiciro. Kanda ku cyapa urebe igisobanuro cyacyo, cyangwa witoze ukoresheje amakarita yo kwibuka."
      />
      <div className="container-page pb-12">
        <Suspense fallback={<SignsSkeleton />}>
          <Signs />
        </Suspense>
      </div>
    </>
  );
}
