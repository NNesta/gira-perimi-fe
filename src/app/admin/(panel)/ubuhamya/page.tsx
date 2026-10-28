import { BadgeCheck, EyeOff, Lock, MessageSquareQuote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TestimonialActions } from "@/components/admin/testimonial-actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { cn } from "@/lib/cn";
import { formatDayLong, timeAgo } from "@/lib/format";
import type { AdminTestimonial, TestimonialStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Ubuhamya" };

const TABS: { id: TestimonialStatus | "all"; label: string }[] = [
  { id: "pending", label: "Bitegereje" },
  { id: "approved", label: "Byemejwe" },
  { id: "hidden", label: "Byahishwe" },
  { id: "all", label: "Byose" },
];

async function TestimonialList({ searchParams }: { searchParams: PageProps<"/admin/ubuhamya">["searchParams"] }) {
  const params = await searchParams;
  const tab = TABS.find((t) => t.id === params.status)?.id ?? "pending";
  const items = await adminFetch<AdminTestimonial[]>(`/admin/testimonials${tab === "all" ? "" : `?status=${tab}`}`);

  return (
    <>
      <nav aria-label="Uko bihagaze" className="mb-6 inline-flex flex-wrap rounded-2xl border border-line bg-surface p-1 shadow-soft">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "pending" ? "/admin/ubuhamya" : `/admin/ubuhamya?status=${t.id}`}
            aria-current={t.id === tab ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              t.id === tab ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-surface-2",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <p className="card p-10 text-center text-muted">Nta buhamya buri hano.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((t) => (
            <li key={t.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/abanyeshuri/${t.user_id}`} className="font-bold hover:text-brand-600">
                  {t.name}
                </Link>
                <span className="text-sm text-muted">{t.email}</span>
                {t.status === "approved" && (
                  <Badge tone="brand">
                    <BadgeCheck className="size-3.5" aria-hidden /> Bwemejwe
                  </Badge>
                )}
                {t.status === "hidden" && (
                  <Badge>
                    <EyeOff className="size-3.5" aria-hidden /> Bwahishwe
                  </Badge>
                )}
                {!t.public && (
                  <Badge tone="sun">
                    <Lock className="size-3.5" aria-hidden /> Ntashaka ko bugaragara
                  </Badge>
                )}
                <span className="ml-auto text-xs text-muted">{timeAgo(t.created_at)}</span>
              </div>
              <blockquote className="mt-3 flex gap-3 rounded-2xl bg-surface-2 p-4 text-lg leading-relaxed">
                <MessageSquareQuote className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden />
                {t.text}
              </blockquote>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted">Yatsinze ikizamini cyo ku wa {formatDayLong(t.exam_date)}</span>
                <TestimonialActions id={t.id} status={t.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function TestimonialsPage({ searchParams }: PageProps<"/admin/ubuhamya">) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Ubuyobozi</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Ubuhamya</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Ibyo abanyeshuri banditse nyuma yo gutsinda ikizamini nyirizina. Ubwemejwe kandi nyirabwo yemeye ko bugaragara
          ni bwo bwonyine bujya ku rupapuro rw’ibanze.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
        <TestimonialList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
