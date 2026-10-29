import type { Metadata } from "next";
import { Suspense } from "react";

import { NewSchoolForm, SchoolCard } from "@/components/admin/school-admin";
import { PageSkeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import type { AdminSchool } from "@/lib/types";

export const metadata: Metadata = { title: "Amashuri" };

async function Schools() {
  const schools = await adminFetch<AdminSchool[]>("/admin/schools");
  return (
    <div className="space-y-5">
      <NewSchoolForm />
      {schools.length === 0 ? (
        <p className="card p-6 text-center text-muted">Nta shuri rirongerwaho.</p>
      ) : (
        schools.map((school) => <SchoolCard key={school.id} school={school} />)
      )}
    </div>
  );
}

/** Driving schools: open one, list its instructors by email; they then make classes from /umwarimu. */
export default function AdminSchoolsPage() {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <h1 className="text-3xl font-extrabold">Amashuri yigisha gutwara</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Ongeraho ishuri n’imeyili z’abarimu baryo. Umwarimu yinjira kuri Tsinda Neza akoresheje iyo meyili (Google
        cyangwa link), agakora amatsinda, akabona aho abanyeshuri binjiye mu matsinda ye bageze.
      </p>
      <div className="mt-8">
        <Suspense fallback={<PageSkeleton title={false} cards={2} />}>
          <Schools />
        </Suspense>
      </div>
    </div>
  );
}
