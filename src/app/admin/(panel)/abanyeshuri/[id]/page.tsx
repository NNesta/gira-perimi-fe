import { ArrowLeft, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { READINESS_BADGES } from "@/components/admin/readiness-badges";
import { UserActions } from "@/components/admin/user-actions";
import { LearnerProgress } from "@/components/learners/learner-progress";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AdminUserDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Umunyeshuri" };

async function Detail({ params }: { params: PageProps<"/admin/abanyeshuri/[id]">["params"] }) {
  const { id } = await params;
  const user = await adminFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`);
  const badge = READINESS_BADGES[user.readiness.status];

  return (
    <div className="space-y-6">
      <section className="card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} src={user.picture_url} size={84} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{user.name}</h1>
            <p className="mt-1 flex items-center gap-2 truncate text-muted">
              <Mail className="size-4 shrink-0" /> {user.email}
            </p>
            {user.phone && (
              <p className="mt-0.5 flex items-center gap-2 text-muted">
                <Phone className="size-4" /> {user.phone}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <Badge tone={user.plan === "premium" ? "sun" : "neutral"}>{user.plan === "premium" ? "Ifatabuguzi" : "Ubuntu"}</Badge>
              {!user.is_active && <Badge tone="signal">Konti yahagaritswe</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <UserActions userId={user.id} isActive={user.is_active} plan={user.plan} />
          <DeleteUserButton userId={user.id} name={user.name} email={user.email} redirectTo="/admin/abanyeshuri" />
        </div>
      </section>

      <LearnerProgress
        learner={user}
        facts={[
          { label: "Yiyandikishije", value: formatDate(user.created_at) },
          { label: "Aheruka kwinjira", value: user.last_login_at ? formatDateTime(user.last_login_at) : "—" },
        ]}
      />
    </div>
  );
}

export default function AdminUserPage({ params }: PageProps<"/admin/abanyeshuri/[id]">) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <Link href="/admin/abanyeshuri" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Abanyeshuri bose
      </Link>
      <Suspense fallback={<PageSkeleton title={false} cards={4} />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
