import type { Metadata } from "next";
import { Suspense } from "react";

import { PracticeLauncher } from "@/components/practice/practice-launcher";
import { PageHeader } from "@/components/ui/section-heading";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import type { Dashboard, Topic } from "@/lib/types";

export const metadata: Metadata = {
  title: "Imyitozo",
  description: "Witoze ibibazo by’ikizamini cy’amategeko y’umuhanda ukurikije ibice, urebe ako kanya igisubizo cy’ukuri.",
};

async function Launcher() {
  const [topics, dashboard] = await Promise.all([
    learnerFetch<Topic[]>("/topics", "/imyitozo"),
    learnerFetch<Dashboard>("/me/dashboard", "/imyitozo"),
  ]);
  return <PracticeLauncher topics={topics} mastery={dashboard.topics} />;
}

export default function PracticePage() {
  return (
    <>
      <PageHeader
        eyebrow="Imyitozo"
        title="Witoze ku buryo bwawe"
        description="Hitamo igice n’umubare w’ibibazo. Nyuma ya buri gisubizo uhita ubona niba ari cyo, n’igisubizo cy’ukuri iyo wibeshye."
      />
      <div className="container-page py-10">
        <Suspense fallback={<PageSkeleton title={false} />}>
          <Launcher />
        </Suspense>
      </div>
    </>
  );
}
