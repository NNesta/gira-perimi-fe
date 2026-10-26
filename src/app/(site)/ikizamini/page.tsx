import { CircleCheck, Clock, ListChecks, Lock, ShieldCheck, Target, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ExamStartButton } from "@/components/exam/exam-start-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch } from "@/lib/api-server";
import { formatDate, formatScore } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ikizamini cy’igerageza",
  description: "Kora ikizamini cy’igerageza cy’amategeko y’umuhanda kimeze nk’icya Polisi: ibibazo 20 mu minota 20, amanota 12 kugira ngo utsinde.",
};

const RULES = [
  { icon: ListChecks, title: "Ibibazo 20", text: "Bitoranywa ku buryo butunguranye mu bibazo 399 by’ikizamini nyirizina." },
  { icon: Clock, title: "Iminota 20", text: "Isaha itangira kubara ukimara gutangira. Igihe kirangiye, ikizamini kirifunga." },
  { icon: Target, title: "Nibura 12/20", text: "Ugomba gusubiza neza nibura ibibazo 12 (60%) kugira ngo utsinde." },
  { icon: Lock, title: "Nta gufasha", text: "Ibisubizo by’ukuri ubibona ikizamini kirangiye, nk’uko bigenda kwa Polisi." },
];

async function StartPanel() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="space-y-4">
        <ExamStartButton signedIn={false} />
        <p className="text-sm text-muted">Ugomba kwinjira kugira ngo ibizamini byawe n’amanota bibikwe.</p>
      </div>
    );
  }
  const dashboard = await serverFetch<Dashboard>("/me/dashboard");
  const { readiness, exams, recent_exams: recent } = dashboard;
  return (
    <div className="space-y-6">
      <ExamStartButton signedIn resumeId={dashboard.in_progress_exam} />
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ibizamini", value: `${readiness.exams_completed}` },
          { label: "Impuzandengo", value: formatScore(exams.average) },
          { label: "Amanota meza", value: formatScore(exams.best) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-surface-2 p-3 text-center">
            <p className="font-display text-2xl font-extrabold">{item.value}</p>
            <p className="text-xs font-semibold text-muted">{item.label}</p>
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <div>
          <p className="text-sm font-bold text-muted">Ibizamini uheruka gukora</p>
          <ul className="mt-2 divide-y divide-line">
            {recent.slice(0, 3).map((exam) => (
              <li key={exam.id}>
                <Link href={`/ikizamini/${exam.id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600">
                  <span>{formatDate(exam.started_at)}</span>
                  <span className="flex items-center gap-2 font-bold">
                    {exam.score ?? "—"}/{exam.total}
                    <Badge tone={exam.passed ? "brand" : "signal"}>{exam.passed ? "Yatsinze" : "Ntiyatsinze"}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/ibizamini" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
            Reba byose
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ExamIntroPage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
      <div className="container-page relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Ikizamini cy’igerageza</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Isuzume nk’uri kwa Polisi</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Ikizamini cy’igerageza gikurikiza imiterere y’ikizamini cy’uruhushya rw’agateganyo. Gikore inshuro nyinshi
            kugeza amanota yawe ahamye hejuru ya 15/20.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {RULES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card flex gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-asphalt text-sun-300 dark:bg-white/10">
                  <Icon className="size-6" />
                </span>
                <span>
                  <span className="block text-lg font-bold">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-start gap-3 rounded-3xl border border-brand-200 bg-brand-50/70 p-5 dark:border-brand-400/25 dark:bg-brand-500/10">
            <Trophy className="mt-0.5 size-6 shrink-0 text-brand-600" />
            <p className="leading-relaxed text-ink-soft">
              <strong className="text-ink">Igihe witeguye:</strong> iyo umaze gukora ibizamini by’igerageza birenga 10
              kandi impuzandengo yawe ikarenga 15/20, ikibaho cyawe kikubwira ko ushobora kujya kwiyandikisha ku
              kizamini nyirizina.
            </p>
          </div>
        </div>

        <div className="card relative overflow-hidden p-6 sm:p-8 lg:sticky lg:top-24">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-ocean-400 to-sun-300" />
          <p className="flex items-center gap-2 text-sm font-bold text-muted">
            <ShieldCheck className="size-4 text-brand-500" /> Mbere yo gutangira
          </p>
          <ul className="mt-4 space-y-2.5 text-ink-soft">
            {[
              "Shaka ahantu hatuje, utazahungabanywa iminota 20.",
              "Soma buri kibazo witonze n’amashusho yacyo.",
              "Ushobora gusubira ku kibazo icyo ari cyo cyose mbere yo gusoza.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2.5">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-500" /> {tip}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
              <StartPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
