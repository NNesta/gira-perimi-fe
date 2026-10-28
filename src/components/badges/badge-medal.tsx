import {
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  Flame,
  Lock,
  Medal,
  Star,
  Target,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { Badge } from "@/lib/types";

const LOOK: Record<string, { icon: LucideIcon; tone: string }> = {
  "ikizamini-cya-mbere": { icon: ClipboardCheck, tone: "from-ocean-400 to-ocean-600 text-white" },
  natsinze: { icon: Trophy, tone: "from-sun-200 to-sun-400 text-asphalt" },
  "ibizamini-10": { icon: Medal, tone: "from-ocean-500 to-ocean-700 text-white" },
  "amanota-yose": { icon: Star, tone: "from-sun-300 to-sun-500 text-asphalt" },
  witeguye: { icon: BadgeCheck, tone: "from-brand-400 to-brand-600 text-white" },
  "iminsi-3": { icon: Flame, tone: "from-signal-400 to-signal-500 text-white" },
  "iminsi-7": { icon: Flame, tone: "from-signal-500 to-signal-600 text-white" },
  "iminsi-30": { icon: Flame, tone: "from-signal-600 to-signal-700 text-white" },
  "ibibazo-100": { icon: Target, tone: "from-brand-300 to-brand-500 text-white" },
  "ibibazo-1000": { icon: Target, tone: "from-brand-500 to-brand-700 text-white" },
  "ibyapa-byose": { icon: TriangleAlert, tone: "from-signal-400 to-sun-400 text-white" },
  "amasomo-yose": { icon: BookOpen, tone: "from-brand-500 to-ocean-600 text-white" },
};

/** Round medallion: in colour once earned, greyed with a lock (and a progress ring) until then. */
export function BadgeMedal({ badge, size = 64, className }: { badge: Badge; size?: number; className?: string }) {
  const look = LOOK[badge.id] ?? { icon: Medal, tone: "from-brand-400 to-brand-600 text-white" };
  const Icon = look.icon;
  const ratio = badge.target ? badge.current / badge.target : 0;
  const ring = 2 * Math.PI * 46;
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      {badge.earned ? (
        <span
          className={cn(
            "grid size-full place-items-center rounded-full bg-gradient-to-br shadow-[0_8px_20px_-8px_rgb(15_23_42/0.45)] ring-4 ring-white/80 dark:ring-white/10",
            look.tone,
          )}
        >
          <Icon style={{ width: size * 0.44, height: size * 0.44 }} aria-hidden />
        </span>
      ) : (
        <>
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx={50} cy={50} r={46} fill="none" strokeWidth={6} className="stroke-surface-2" />
            {ratio > 0 && (
              <circle
                cx={50}
                cy={50}
                r={46}
                fill="none"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={`${ring * ratio} ${ring}`}
                className="stroke-brand-400"
              />
            )}
          </svg>
          <span className="grid size-[82%] place-items-center rounded-full bg-surface-2 text-muted">
            <Icon style={{ width: size * 0.36, height: size * 0.36 }} aria-hidden />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 grid size-[34%] place-items-center rounded-full bg-surface text-muted ring-1 ring-line">
            <Lock style={{ width: size * 0.17, height: size * 0.17 }} aria-hidden />
          </span>
        </>
      )}
    </span>
  );
}
