import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { READINESS_BADGES } from "@/components/admin/readiness-badges";
import { UsersControls } from "@/components/admin/users-controls";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { cn } from "@/lib/cn";
import { formatDate, formatScore, timeAgo } from "@/lib/format";
import type { AdminUserRow, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Abanyeshuri" };

const PAGE_SIZE = 20;

async function UsersTable({ searchParams }: { searchParams: PageProps<"/admin/abanyeshuri">["searchParams"] }) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const page = Math.max(1, Number(get("page")) || 1);
  const query = new URLSearchParams({
    sort: get("sort") ?? "joined",
    order: get("order") === "asc" ? "asc" : "desc",
    page: String(page),
    page_size: String(PAGE_SIZE),
  });
  if (get("q")) query.set("search", get("q")!);
  const data = await adminFetch<Page<AdminUserRow>>(`/admin/users?${query.toString()}`);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const link = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => typeof v === "string") as [string, string][]);
    next.set("page", String(p));
    return `/admin/abanyeshuri?${next.toString()}`;
  };

  return (
    <>
      <p className="mb-3 text-sm text-muted">
        {data.total === 0 ? "Nta munyeshuri ubonetse." : `Abanyeshuri ${data.total} · urupapuro ${page}/${pages}`}
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead className="bg-surface-2 text-sm text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Umunyeshuri</th>
                <th scope="col" className="px-4 py-3 font-semibold">Yiyandikishije</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Ibizamini</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Impuzandengo</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Amanota yo hejuru</th>
                <th scope="col" className="px-4 py-3 font-semibold">Uko ahagaze</th>
                <th scope="col" className="px-4 py-3 font-semibold">Aheruka</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Ibikorwa</span>
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.items.map((u) => {
                const badge = READINESS_BADGES[u.readiness_status];
                return (
                  <tr key={u.id} className={cn("border-t border-line transition hover:bg-surface-2/50", !u.is_active && "opacity-60")}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/abanyeshuri/${u.id}`} className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.picture_url} size={38} />
                        <span className="min-w-0">
                          <span className="block max-w-56 truncate font-semibold hover:text-brand-600">{u.name}</span>
                          <span className="block max-w-56 truncate text-sm text-muted">{u.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{u.exams_completed}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatScore(u.average)}</td>
                    <td className="px-4 py-3 text-right">{u.best ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1.5">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        {!u.is_active && <Badge tone="signal">Yahagaritswe</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{u.last_active_at ? timeAgo(u.last_active_at) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/abanyeshuri/${u.id}`}
                          aria-label={`Reba ${u.name}`}
                          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <DeleteUserButton userId={u.id} name={u.name} email={u.email} compact />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {pages > 1 && (
        <nav aria-label="Impapuro" className="mt-5 flex items-center justify-between">
          {page > 1 ? (
            <Link href={link(page - 1)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              <ChevronLeft className="size-4" /> Ibibanza
            </Link>
          ) : (
            <span />
          )}
          {page < pages && (
            <Link href={link(page + 1)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              Ibikurikira <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/abanyeshuri">) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Ubuyobozi</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Abanyeshuri</h1>
        <p className="mt-2 text-muted">Abiyandikishije bose n’uko bitwara mu bizamini by’igerageza.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-11 rounded-xl" />}>
        <UsersControls />
      </Suspense>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-[28rem] rounded-3xl" />}>
          <UsersTable searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
