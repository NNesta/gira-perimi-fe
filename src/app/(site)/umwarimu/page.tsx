import { ArrowRight, School, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ClassCodeShare, NewClassForm } from "@/components/teaching/teaching-actions";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { plural } from "@/lib/format";
import type { TeachingSchool } from "@/lib/types";

export const metadata: Metadata = { title: "Umwarimu", robots: { index: false } };

async function Teaching() {
  const schools = await learnerFetch<TeachingSchool[]>("/teaching", "/umwarimu");
  if (schools.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <School className="mx-auto size-10 text-muted" aria-hidden />
        <h2 className="mt-4 text-xl font-bold">Iki gice ni icy’abarimu b’amashuri yigisha gutwara</h2>
        <p className="mt-2 text-muted">
          Ishuri ryawe ryifuza gukoresha Tsinda Neza? Ritwandikire, tukongere imeyili yawe ku rutonde rw’abarimu baryo.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      {schools.map((school) => (
        <section key={school.id}>
          <h2 className="text-2xl font-extrabold">{school.name}</h2>
          <div className="mt-4">
            <NewClassForm schoolId={school.id} />
          </div>
          {school.classes.length === 0 ? (
            <p className="mt-6 text-muted">
              Kora itsinda rya mbere: buri tsinda rigira kode abanyeshuri bakoresha binjiramo.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 lg:grid-cols-2">
              {school.classes.map((klass) => (
                <li key={klass.id} className="card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold">{klass.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Users className="size-4" aria-hidden /> {plural(klass.learners, "umunyeshuri", "abanyeshuri")}
                      </p>
                    </div>
                    {klass.archived && <Badge>Ryabitswe</Badge>}
                  </div>
                  {!klass.archived && (
                    <div className="mt-4">
                      <ClassCodeShare code={klass.join_code} className={klass.name} school={school.name} />
                    </div>
                  )}
                  <Link
                    href={`/umwarimu/${klass.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline dark:text-brand-300"
                  >
                    Reba aho abanyeshuri bageze <ArrowRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

/** Instructors of a driving school: their classes, join codes, and each class's progress. */
export default function TeachingPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Amatsinda yanjye</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Kora itsinda, uhe abanyeshuri kode yaryo. Iyo binjiyemo, ubona aho buri wese ageze yitegura ikizamini
        n’ibice akeneye kongeramo imbaraga.
      </p>
      <div className="mt-8">
        <Suspense fallback={<PageSkeleton title={false} cards={2} />}>
          <Teaching />
        </Suspense>
      </div>
    </div>
  );
}
