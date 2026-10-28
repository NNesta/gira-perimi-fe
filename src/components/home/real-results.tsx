import { Quote } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { serverFetch } from "@/lib/api-server";
import { formatDayLong } from "@/lib/format";
import type { OutcomeStats } from "@/lib/types";

/**
 * "Abize kuri Tsinda Neza baratsinze": the real-exam pass rate learners reported and the testimonials they agreed to
 * share. Renders nothing until there is something true to show (enough answers, or an approved testimonial).
 */
export async function RealResults() {
  let stats: OutcomeStats;
  try {
    stats = await serverFetch<OutcomeStats>("/stats/outcomes");
  } catch {
    return null; // the home page never fails because the API is unreachable
  }
  if (stats.pass_rate === null && stats.testimonials.length === 0) return null;

  return (
    <section className="container-page py-20 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Ubuhamya"
          title="Abize kuri Tsinda Neza baratsinze"
          description="Nyuma y’itariki y’ikizamini, tubaza abanyeshuri uko byagenze. Dore ibyo batubwiye."
        />
      </Reveal>
      <div
        className={
          stats.pass_rate !== null
            ? "mt-12 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]"
            : "mt-12"
        }
      >
        {stats.pass_rate !== null && (
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-ocean-600 p-7 text-white shadow-lift">
            <p className="font-display text-7xl font-extrabold leading-none">{Math.round(stats.pass_rate * 100)}%</p>
            <p className="mt-4 text-lg font-semibold leading-snug">y’abakoresha Tsinda Neza bakoze ikizamini baratsinze</p>
            <p className="mt-3 text-sm text-white/75">
              Bishingiye ku bisubizo by’abantu {stats.answered} batubwiye uko ikizamini cyabo cyagenze.
            </p>
          </div>
        )}
        {stats.testimonials.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {stats.testimonials.map((t, i) => (
              <li key={i} className="card flex flex-col p-6">
                <Quote className="size-7 text-brand-400" aria-hidden />
                <p className="mt-3 flex-1 text-lg leading-relaxed text-ink">{t.text}</p>
                <p className="mt-4 text-sm font-semibold text-muted">
                  {t.name} · yatsinze ikizamini ku wa {formatDayLong(t.exam_date)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
