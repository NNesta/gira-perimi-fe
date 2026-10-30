import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { SignRush } from "@/components/signs/sign-rush";
import { PageHeader } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/api-server";
import { pageShare } from "@/lib/site";
import type { Sign, SignCategory } from "@/lib/types";

const DESCRIPTION =
  "Umukino w’ibyapa byo ku muhanda: hitamo icyo icyapa gisobanura mbere y’uko imodoka ikigeraho, uce agahigo kawe, uhangane n’inshuti. Ku buntu.";

export const metadata: Metadata = {
  title: "Soma icyapa!",
  description: DESCRIPTION,
  ...pageShare("Soma icyapa! · Tsinda Neza", DESCRIPTION),
};

async function Game() {
  const [data, store] = await Promise.all([
    serverFetch<{ categories: SignCategory[]; signs: Sign[] }>("/signs"),
    cookies(),
  ]);
  return <SignRush signs={data.signs} signedIn={store.has("gp_session")} />;
}

function GameSkeleton() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

/** "Soma icyapa!": the sign game. Public, like the right-of-way scenes: a free taste of the course, no account needed. */
export default function SignGamePage() {
  return (
    <>
      <PageHeader
        eyebrow="Umukino"
        title="Soma icyapa!"
        description="Ibyapa biza imbere y’imodoka yawe. Hitamo icyo buri cyapa gisobanura mbere y’uko ukigeraho: uko usubiza vuba, ni ko amanota yiyongera."
      />
      <div className="container-page py-8 sm:py-10">
        <Suspense fallback={<GameSkeleton />}>
          <Game />
        </Suspense>
      </div>
    </>
  );
}
