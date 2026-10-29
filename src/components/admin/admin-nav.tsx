"use client";

import { LayoutDashboard, Lightbulb, LogOut, MessageSquareQuote, School, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { leaveSession } from "@/lib/redirect";

const LINKS = [
  { href: "/admin", label: "Incamake", icon: LayoutDashboard },
  { href: "/admin/abanyeshuri", label: "Abanyeshuri", icon: Users },
  { href: "/admin/ibisobanuro", label: "Ibisobanuro", icon: Lightbulb },
  { href: "/admin/ubuhamya", label: "Ubuhamya", icon: MessageSquareQuote },
  { href: "/admin/amashuri", label: "Amashuri", icon: School },
];

export function AdminNavView({ pathname, vertical = true }: { pathname: string; vertical?: boolean }) {
  return (
    <nav aria-label="Ubuyobozi" className={cn("flex gap-1", vertical ? "flex-col" : "flex-row")}>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:gap-3 sm:px-3.5 sm:py-2.5",
              active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon className="size-[1.15rem]" aria-hidden />
            {/* Phones show icons only in the top bar; the label stays for screen readers. */}
            <span className={vertical ? undefined : "sr-only sm:not-sr-only"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav({ vertical = true }: { vertical?: boolean }) {
  return <AdminNavView pathname={usePathname()} vertical={vertical} />;
}

export function AdminLogoutButton({ compact = false }: { compact?: boolean }) {
  async function logout() {
    await api("/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    // Back to the public site (the admin sign-in page is never linked), dropping every admin page held in memory.
    await leaveSession();
  }
  if (compact) {
    return (
      <button
        type="button"
        onClick={logout}
        aria-label="Sohoka"
        className="grid size-10 place-items-center rounded-xl text-white/65 transition hover:bg-white/6 hover:text-white"
      >
        <LogOut className="size-[1.15rem]" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/6 hover:text-white"
    >
      <LogOut className="size-[1.15rem]" /> Sohoka
    </button>
  );
}
