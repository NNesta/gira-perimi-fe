"use client";

import { ClipboardList, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { leaveSession } from "@/lib/redirect";
import type { User } from "@/lib/types";

const LINKS = [
  { href: "/ikibaho", label: "Ikibaho cyanjye", icon: LayoutDashboard },
  { href: "/ibizamini", label: "Ibizamini nakoze", icon: ClipboardList },
  { href: "/umwirondoro", label: "Umwirondoro", icon: UserRound },
];

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  async function logout() {
    setLeaving(true);
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    leaveSession();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-1 pr-1 transition hover:bg-surface-2 sm:pr-3"
      >
        <Avatar name={user.name} src={user.picture_url} size={36} />
        <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
          {user.given_name || user.name.split(" ")[0]}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line p-4">
              <Avatar name={user.name} src={user.picture_url} size={44} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="p-2">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink"
                >
                  <Icon className="size-4 text-muted" aria-hidden />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                disabled={leaving}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-signal-600 transition hover:bg-signal-50 dark:text-signal-400 dark:hover:bg-signal-500/10"
              >
                <LogOut className="size-4" aria-hidden />
                {leaving ? "Urasohoka..." : "Sohoka"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
