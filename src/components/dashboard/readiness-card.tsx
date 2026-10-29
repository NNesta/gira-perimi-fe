import { BadgeCheck, ExternalLink, Hourglass } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { formatScore, plural } from "@/lib/format";
import type { Readiness, User } from "@/lib/types";

function message(r: Readiness): string {
  if (r.status === "new") return "Kora ikizamini cy’igerageza cya mbere kugira ngo tumenye aho uhagaze.";
  if (r.ready) {
    return `Witeguye! Impuzandengo y’ibizamini ${r.average_window} biheruka irenga ${formatScore(r.average_required)}/20. Iyandikishe ku kizamini nyirizina.`;
  }
  const parts: string[] = [];
  if (r.exams_remaining > 0) parts.push(`usigaje ${plural(r.exams_remaining, "ikizamini", "ibizamini")}`);
  if ((r.average ?? 0) <= r.average_required) {
    parts.push(`impuzandengo y’ibizamini ${r.average_window} biheruka igomba kurenga ${formatScore(r.average_required)}/20`);
  }
  const lead = r.status === "almost" ? "Uri hafi kugera ku ntego:" : "Komeza witoze:";
  return `${lead} ${parts.join(", kandi ")}.`;
}

function Meter({ label, value, max, display, good }: { label: string; value: number; max: number; display: string; good: boolean }) {
  const ratio = Math.min(1, Math.max(0, value / max));
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-white/75">{label}</span>
        <span className="font-bold">{display}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000", good ? "bg-sun-300" : "bg-white/80")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

/** The learner's "readiness card": a playful licence-style card, not a replica of an official document. */
export function ReadinessCard({ user, readiness }: { user: User; readiness: Readiness }) {
  const ready = readiness.ready;
  return (
    <section
      aria-label="Ikarita y’imyiteguro"
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lift sm:p-8",
        ready ? "bg-gradient-to-br from-brand-500 via-brand-600 to-ocean-700" : "bg-gradient-to-br from-asphalt via-[#223049] to-brand-800",
      )}
    >
      <div aria-hidden className="absolute -right-24 bottom-24 h-2 w-72 rotate-[-28deg] bg-[repeating-linear-gradient(90deg,#fad201_0_26px,transparent_26px_44px)] opacity-25" />
      <div aria-hidden className="absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
            <LogoMark className="size-6" /> Ikarita y’imyiteguro
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
              ready ? "bg-sun-300 text-asphalt" : "bg-white/15 text-white",
            )}
          >
            {ready ? <BadgeCheck className="size-4" /> : <Hourglass className="size-4" />}
            {ready ? "Witeguye" : readiness.status === "almost" ? "Uri hafi" : "Uracyitoza"}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Avatar name={user.name} src={user.picture_url} size={72} className="ring-4 ring-white/25" />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-extrabold">{user.name}</p>
            <p className="truncate text-sm text-white/70">{user.email}</p>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <Meter
            label="Ibizamini by’igerageza"
            value={readiness.exams_completed}
            max={readiness.exams_required}
            display={
              readiness.exams_completed >= readiness.exams_required
                ? `${readiness.exams_completed} ✓`
                : `${readiness.exams_completed}/${readiness.exams_required}`
            }
            good={readiness.exams_completed >= readiness.exams_required}
          />
          <Meter
            label={`Impuzandengo y’ibizamini ${readiness.average_window} biheruka (igomba kurenga ${formatScore(readiness.average_required)})`}
            value={readiness.average ?? 0}
            max={20}
            display={`${formatScore(readiness.average)}/20`}
            good={(readiness.average ?? 0) > readiness.average_required}
          />
        </div>

        <p className="mt-6 leading-relaxed text-white/90">{message(readiness)}</p>
        {ready && (
          <a
            href="https://irembo.gov.rw"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-brand-700 transition hover:bg-white/90"
          >
            Iyandikishe kuri Irembo <ExternalLink className="size-4" />
          </a>
        )}
        <div aria-hidden className="mt-7 h-1.5 rounded-full bg-[linear-gradient(90deg,#00a1de_0_50%,#fad201_50%_75%,#20603d_75%)]" />
      </div>
      {ready && (
        <span
          aria-hidden
          className="absolute right-6 top-24 rotate-[-12deg] rounded-xl border-4 border-sun-300 px-3 py-1 font-display text-2xl font-extrabold tracking-wider text-sun-300 opacity-90 sm:right-10"
        >
          WITEGUYE
        </span>
      )}
    </section>
  );
}
