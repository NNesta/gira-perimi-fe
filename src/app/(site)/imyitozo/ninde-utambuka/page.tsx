import type { Metadata } from "next";

import { RightOfWay } from "@/components/scenarios/right-of-way";
import { PageHeader } from "@/components/ui/section-heading";
import { pageShare } from "@/lib/site";

const DESCRIPTION =
  "Amasangano 12 ashushanyije: reba ibyapa, amatara n’aho buri kinyabiziga kigana, hanyuma ukande ku gitambuka mbere. Ku buntu.";

export const metadata: Metadata = {
  title: "Ninde utambuka mbere?",
  description: DESCRIPTION,
  ...pageShare("Ninde utambuka mbere? · Tsinda Neza", DESCRIPTION),
};

/** Interactive right-of-way scenes. Public: a free taste of the course, no account needed. */
export default function RightOfWayPage() {
  return (
    <>
      <PageHeader
        eyebrow="Imyitozo"
        title="Ninde utambuka mbere?"
        description="Reba ibyapa, amatara n’aho buri kinyabiziga kigana, hanyuma ukande ku gitambuka mbere. Nyuma y’igisubizo, reba uko bagenda."
      />
      <div className="container-page py-8 sm:py-10">
        <RightOfWay />
      </div>
    </>
  );
}
