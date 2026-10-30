import { ArrowRight, History, Repeat, Search, Signpost, Split, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PracticeLauncher } from "@/components/practice/practice-launcher";
import { OfflineCard } from "@/components/pwa/offline-card";
import { PageHeader } from "@/components/ui/section-heading";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { plural } from "@/lib/format";
import type { Dashboard, Topic } from "@/lib/types";

export const metadata: Metadata = {
  title: "Imyitozo",
  description: "Witoze ibibazo by’ikizamini cy’amategeko y’umuhanda ukurikije ibice, urebe ako kanya igisubizo cy’ukuri.",
};

const TOOLS: {
  href: "/imyitozo/soma-icyapa" | "/imyitozo/ninde-utambuka" | "/imyitozo/amakosa" | "/imyitozo/shakisha";
  icon: LucideIcon;
  title: string;
  text: string;
  tone: string;
}[] = [
  {
    href: "/imyitozo/soma-icyapa",
    icon: Signpost,
    title: "Soma icyapa!",
    text: "Umukino: menya icyapa mbere y’uko imodoka ikigeraho, uce agahigo kawe.",
    tone: "bg-sun-500",
  },
  {
    href: "/imyitozo/ninde-utambuka",
    icon: Split,
    title: "Ninde utambuka mbere?",
    text: "Amasangano 12 ashushanyije: kanda ku gitambuka mbere.",
    tone: "bg-ocean-500",
  },
  {
    href: "/imyitozo/amakosa",
    icon: History,
    title: "Ibyo nibeshyeho",
    text: "Ibibazo byose wasubije nabi, n’impamvu igisubizo ari cyo.",
    tone: "bg-signal-500",
  },
  {
    href: "/imyitozo/shakisha",
    icon: Search,
    title: "Shakisha ikibazo",
    text: "Shakisha mu bibazo byose ukoresheje ijambo cyangwa nimero.",
    tone: "bg-brand-500",
  },
];

function Tools() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TOOLS.map((tool) => (
        <Link key={tool.href} href={tool.href} className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white ${tool.tone}`}>
            <tool.icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2 font-bold">
              {tool.title}
              <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-1" aria-hidden />
            </span>
            <span className="mt-1 block text-sm text-muted">{tool.text}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

async function Launcher() {
  const [topics, dashboard] = await Promise.all([
    learnerFetch<Topic[]>("/topics", "/imyitozo"),
    learnerFetch<Dashboard>("/me/dashboard", "/imyitozo"),
  ]);
  const due = dashboard.review.due;
  return (
    <div className="space-y-10">
      {due > 0 && (
        <Link
          href="/isubiramo"
          className="group flex items-center gap-4 rounded-3xl border border-ocean-200 bg-ocean-50 p-5 transition hover:shadow-soft dark:border-ocean-400/25 dark:bg-ocean-500/10"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ocean-500 text-white">
            <Repeat className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Isubiramo ry’uyu munsi: {plural(due, "ikintu", "ibintu")}</span>
            <span className="text-sm text-muted">Ibyo wibeshyeho mbere bigarutse. Bisubiremo mbere y’imyitozo mishya.</span>
          </span>
          <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
      <Tools />
      <PracticeLauncher topics={topics} mastery={dashboard.topics} />
      <OfflineCard uid={dashboard.user.id} />
    </div>
  );
}

export default function PracticePage() {
  return (
    <>
      <PageHeader
        eyebrow="Imyitozo"
        title="Witoze ku buryo bwawe"
        description="Hitamo igice n’umubare w’ibibazo. Nyuma ya buri gisubizo uhita ubona niba ari cyo, n’igisubizo cy’ukuri iyo wibeshye."
      />
      <div className="container-page py-10">
        <Suspense fallback={<PageSkeleton title={false} />}>
          <Launcher />
        </Suspense>
      </div>
    </>
  );
}
