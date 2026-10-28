import { LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { WelcomeFlow } from "@/components/welcome/welcome-flow";
import { learnerFetch, serverFetch } from "@/lib/api-server";
import { safeNext } from "@/lib/redirect";
import type { AuthConfig, LessonSummary, Topic, User } from "@/lib/types";

export const metadata: Metadata = { title: "Ikaze", robots: { index: false } };

async function Welcome({ searchParams }: { searchParams: PageProps<"/ikaze">["searchParams"] }) {
  const { next } = await searchParams;
  const [user, topics, lessons, config] = await Promise.all([
    learnerFetch<User>("/auth/me", "/ikaze"),
    learnerFetch<Topic[]>("/topics", "/ikaze"),
    learnerFetch<LessonSummary[]>("/lessons", "/ikaze"),
    serverFetch<AuthConfig>("/auth/config").catch(() => null),
  ]);
  const destination = safeNext(typeof next === "string" ? next : null);
  return (
    <WelcomeFlow
      user={user}
      topics={topics}
      lessons={lessons.map(({ slug, title, order, topics: covered }) => ({ slug, title, order, topics: covered }))}
      remindersAvailable={!!config?.reminders_available}
      pushPublicKey={config?.push_public_key ?? null}
      next={destination.startsWith("/ikaze") ? "/ikibaho" : destination}
    />
  );
}

/** First-time welcome: exam date, daily goal and a 10-question placement quiz. New learners land here after sign-up. */
export default function WelcomePage({ searchParams }: PageProps<"/ikaze">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <LoaderCircle className="size-10 animate-spin text-brand-500" aria-label="Biracyaza" />
        </div>
      }
    >
      <Welcome searchParams={searchParams} />
    </Suspense>
  );
}
