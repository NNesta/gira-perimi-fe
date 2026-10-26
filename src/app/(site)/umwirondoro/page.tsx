import { CalendarDays, Crown } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { learnerFetch, serverFetch } from "@/lib/api-server";
import { formatDate } from "@/lib/format";
import type { AuthConfig, User } from "@/lib/types";

export const metadata: Metadata = { title: "Umwirondoro" };

async function Profile() {
  const [user, config] = await Promise.all([
    learnerFetch<User>("/auth/me", "/umwirondoro"),
    serverFetch<AuthConfig>("/auth/config").catch(() => null),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="card h-fit p-8 text-center">
        <Avatar name={user.name} src={user.picture_url} size={112} className="mx-auto shadow-lift" />
        <h1 className="mt-5 text-2xl font-extrabold">{user.name}</h1>
        <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge tone={user.plan === "premium" ? "sun" : "brand"}>
            <Crown className="size-3.5" /> {user.plan === "premium" ? "Ifatabuguzi" : "Ubuntu"}
          </Badge>
          <Badge>
            <CalendarDays className="size-3.5" /> Kuva {formatDate(user.created_at)}
          </Badge>
        </div>
      </aside>
      <ProfileForm user={user} remindersAvailable={!!config?.reminders_available} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        }
      >
        <Profile />
      </Suspense>
    </div>
  );
}
