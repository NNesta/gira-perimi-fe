import type { Metadata } from "next";
import { Suspense } from "react";

import { EmailLinkConfirm } from "@/components/auth/email-link-confirm";
import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Injira", robots: { index: false } };

async function Confirm({ searchParams }: { searchParams: PageProps<"/injira/imeyili">["searchParams"] }) {
  const params = await searchParams;
  return (
    <EmailLinkConfirm
      token={typeof params.token === "string" ? params.token : ""}
      next={typeof params.next === "string" ? params.next : undefined}
    />
  );
}

/** Where a sign-in link sent by email lands (see components/auth/email-sign-in.tsx). */
export default function EmailLinkPage({ searchParams }: PageProps<"/injira/imeyili">) {
  return (
    <section className="container-page grid min-h-[calc(100dvh-4rem)] place-items-center py-10">
      <div className="card w-full max-w-md p-7 text-center sm:p-10">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 text-3xl font-extrabold">Murakaza neza!</h1>
        <Suspense fallback={<Skeleton className="mt-8 h-14 w-full rounded-2xl" />}>
          <Confirm searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
