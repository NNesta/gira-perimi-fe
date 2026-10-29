import { ArrowRight, Clock, ListChecks, LogIn, Swords, Target } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ChallengeStandings } from "@/components/challenge/challenge-standings";
import { ChallengeStart } from "@/components/challenge/challenge-start";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch, ServerApiError } from "@/lib/api-server";
import { fetchPublicChallenge } from "@/lib/challenge";
import { plural } from "@/lib/format";
import { pageShare } from "@/lib/site";
import type { Challenge } from "@/lib/types";

const DESCRIPTION = "Ibibazo 20 by’ikizamini cy’amategeko y’umuhanda, mu minota 20. Ese wamutsinda? Ku buntu kuri Tsinda Neza.";

export async function generateMetadata({ params }: PageProps<"/hangana/[code]">): Promise<Metadata> {
  const { code } = await params;
  const challenge = await fetchPublicChallenge(code);
  if (!challenge) return { title: { absolute: "Tsinda Neza" }, robots: { index: false } };
  const title = `${challenge.creator_name} aguhamagariye guhangana: ${challenge.creator_score}/${challenge.total}. Ese wowe?`;
  return {
    title: { absolute: title },
    description: DESCRIPTION,
    robots: { index: false },
    ...pageShare(title, DESCRIPTION, `/hangana/${code}/ifoto`),
  };
}

function Action({ challenge, signedIn }: { challenge: Challenge; signedIn: boolean }) {
  if (!signedIn) {
    return (
      <ButtonLink href={`/injira?next=${encodeURIComponent(`/hangana/${challenge.code}`)}`} size="lg">
        <LogIn className="size-5" /> Injira uhangane
      </ButtonLink>
    );
  }
  if (challenge.is_creator) {
    return <p className="font-semibold text-muted">Uyu mukino ni wowe wawutanze: wohereze inshuti zawe.</p>;
  }
  if (challenge.exam_status === "completed" && challenge.exam_id) {
    return (
      <ButtonLink href={`/ikizamini/${challenge.exam_id}`} size="lg" variant="secondary">
        Reba ibisubizo byawe <ArrowRight className="size-5" />
      </ButtonLink>
    );
  }
  return (
    <ChallengeStart
      code={challenge.code}
      label={challenge.exam_status === "in_progress" ? "Komeza ikizamini" : "Tangira guhangana"}
    />
  );
}

async function ChallengeView({ params }: { params: PageProps<"/hangana/[code]">["params"] }) {
  const { code } = await params;
  let challenge: Challenge;
  try {
    challenge = await serverFetch<Challenge>(`/challenges/${encodeURIComponent(code)}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound();
    throw error;
  }
  const user = await getSessionUser();
  return (
    <div className="mx-auto max-w-2xl">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-asphalt via-[#223049] to-brand-800 p-7 text-center text-white shadow-lift sm:p-12">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
        <div className="relative">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-sun-300 text-asphalt shadow-soft">
            <Swords className="size-8" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-5xl">
            {challenge.creator_name} aguhamagariye guhangana
          </h1>
          <p className="mt-4 text-lg text-white/80">Yabonye</p>
          <p className="font-display text-7xl font-extrabold text-sun-300">
            {challenge.creator_score}
            <span className="text-3xl text-white/70">/{challenge.total}</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Ese wamutsinda? Ibibazo bimwe n’ibyo yakoze, mu minota 20, nk’uko bigenda mu kizamini nyirizina.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="size-4" /> {plural(challenge.total, "ikibazo", "ibibazo")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> Iminota 20
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="size-4" /> Nibura 12 ngo utsinde
            </span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Action challenge={challenge} signedIn={!!user} />
      </div>

      {challenge.standings ? (
        <section className="card mt-8 p-6 sm:p-8">
          <h2 className="text-lg font-bold">Uko mwakoze</h2>
          <div className="mt-4">
            <ChallengeStandings players={challenge.standings} />
          </div>
        </section>
      ) : (
        challenge.players > 0 && (
          <p className="mt-6 text-center text-sm text-muted">
            {challenge.players === 1 ? "Inshuti 1 imaze kuwukora." : `Inshuti ${challenge.players} zimaze kuwukora.`}{" "}
            Amanota yabo uzayabona umaze kuwukora.
          </p>
        )
      )}
    </div>
  );
}

/** Public page behind a "Hangana nanjye" link: the friend's score, and the button to sit the same 20 questions. */
export default function ChallengePage({ params }: PageProps<"/hangana/[code]">) {
  return (
    <div className="container-page py-10 sm:py-16">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl rounded-[2.5rem]" />}>
        <ChallengeView params={params} />
      </Suspense>
    </div>
  );
}
