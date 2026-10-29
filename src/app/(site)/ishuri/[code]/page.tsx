import { CircleCheck, LogIn, School } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { JoinClassButton } from "@/components/teaching/join-class";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch, ServerApiError } from "@/lib/api-server";
import type { ClassPreview, MyClass } from "@/lib/types";

export const metadata: Metadata = { title: "Injira mu itsinda", robots: { index: false } };

async function Join({ params }: { params: PageProps<"/ishuri/[code]">["params"] }) {
  const { code } = await params;
  let preview: ClassPreview;
  try {
    preview = await serverFetch<ClassPreview>(`/classes/join/${encodeURIComponent(code)}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return (
        <p className="mt-6 text-muted">
          Iyo kode ntibonetse cyangwa itsinda ryarafunzwe. Reba ko wayanditse neza, cyangwa ubaze umwarimu wawe.
        </p>
      );
    }
    throw error;
  }
  const user = await getSessionUser();
  const mine = user ? await serverFetch<MyClass[]>("/me/classes").catch(() => []) : [];
  const already = mine.some((c) => c.name === preview.name && c.school === preview.school);

  return (
    <>
      <h1 className="mt-6 text-3xl font-extrabold">{preview.name}</h1>
      <p className="mt-1 text-lg text-muted">{preview.school}</p>
      <div className="mt-8 text-left">
        {!user ? (
          <div className="text-center">
            <p className="mb-5 text-muted">Banza winjire kuri Tsinda Neza, hanyuma winjire mu itsinda.</p>
            <ButtonLink href={`/injira?next=${encodeURIComponent(`/ishuri/${code}`)}`} size="lg">
              <LogIn className="size-5" /> Injira
            </ButtonLink>
          </div>
        ) : already ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
              <CircleCheck className="size-5" /> Uri muri iri tsinda.
            </p>
            <ButtonLink href="/ikibaho">Komeza wige</ButtonLink>
          </div>
        ) : (
          <JoinClassButton code={code} />
        )}
      </div>
    </>
  );
}

/** Where a class's join link lands: which class and school, what joining shares, and the button to join. */
export default function JoinClassPage({ params }: PageProps<"/ishuri/[code]">) {
  return (
    <section className="container-page grid min-h-[calc(100dvh-4rem)] place-items-center py-10">
      <div className="card w-full max-w-lg p-7 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <School className="size-7" aria-hidden />
        </span>
        <Suspense fallback={<Skeleton className="mt-8 h-40 w-full rounded-2xl" />}>
          <Join params={params} />
        </Suspense>
      </div>
    </section>
  );
}
