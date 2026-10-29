import { BatteryFull, SignalHigh, Wifi } from "lucide-react";
import Image, { type StaticImageData } from "next/image";

import resultDark from "@/assets/screens/ibisubizo-dark.webp";
import resultLight from "@/assets/screens/ibisubizo-light.webp";
import dashboardDark from "@/assets/screens/ikibaho-dark.webp";
import dashboardLight from "@/assets/screens/ikibaho-light.webp";
import examDark from "@/assets/screens/ikizamini-dark.webp";
import examLight from "@/assets/screens/ikizamini-light.webp";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

type Screen = { title: string; text: string; alt: string; light: StaticImageData; dark: StaticImageData; main?: boolean };

// Real pages, photographed at phone size by scripts/screenshots.mjs for a demo learner: rerun it when they change.
const SCREENS: Screen[] = [
  {
    title: "Ikizamini cy’igerageza",
    text: "Ibibazo n’amashusho uko biri mu kizamini, isaha ibara.",
    alt: "Ikizamini cy’igerageza kuri telefone: ikibazo gifite ishusho y’icyapa n’ibisubizo bine",
    light: examLight,
    dark: examDark,
  },
  {
    title: "Ikibaho cyawe",
    text: "Iminsi isigaye ngo ukore ikizamini, n’ibyo uri bukore uyu munsi.",
    alt: "Ikibaho cy’umunyeshuri kuri telefone: iminsi isigaye ku kizamini na gahunda y’uyu munsi",
    light: dashboardLight,
    dark: dashboardDark,
    main: true,
  },
  {
    title: "Amanota ako kanya",
    text: "Ikizamini kirangiye, ubona amanota n’ibisubizo by’ukuri n’impamvu yabyo.",
    alt: "Amanota y’ikizamini cy’igerageza kuri telefone: 18 kuri 20, watsinze",
    light: resultLight,
    dark: resultDark,
  },
];

/** A phone around a screenshot: status bar, rounded screen, and the picture that matches the site's theme. */
function Phone({ screen }: { screen: Screen }) {
  const sizes = "(min-width: 1024px) 17rem, (min-width: 768px) 14rem, 16rem";
  return (
    <div className="rounded-[2.6rem] bg-asphalt p-2 shadow-lift ring-1 ring-black/5 dark:bg-[#03060c] dark:ring-white/10">
      <div className="overflow-hidden rounded-[2.15rem] bg-surface">
        <div aria-hidden className="relative flex h-7 items-center justify-between px-6 text-[0.65rem] font-bold text-ink">
          <span>9:41</span>
          <span className="absolute left-1/2 top-1.5 h-[1.1rem] w-16 -translate-x-1/2 rounded-full bg-asphalt dark:bg-black" />
          <span className="flex items-center gap-1">
            <SignalHigh className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        <Image src={screen.light} alt={screen.alt} sizes={sizes} placeholder="blur" className="block h-auto w-full dark:hidden" />
        <Image src={screen.dark} alt={screen.alt} sizes={sizes} placeholder="blur" className="hidden h-auto w-full dark:block" />
      </div>
    </div>
  );
}

/** "Reba imbere": the product itself, as a learner sees it on a phone. */
export function ProductScreens() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Reba imbere"
            title="Uko Tsinda Neza imeze kuri telefone yawe"
            description="Ikizamini cy’igerageza, ikibaho cyawe n’amanota yawe, uko uzabibona umaze kwinjira."
          />
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        {/* Phones scroll sideways on small screens (the dashboard first) and stand side by side from md up. */}
        <ul className="container-page mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] md:items-start md:justify-center md:gap-8 md:overflow-visible md:pt-8">
          {SCREENS.map((screen) => (
            <li
              key={screen.title}
              className={cn(
                "w-64 shrink-0 snap-center md:w-56 lg:w-[17rem]",
                screen.main ? "order-first md:order-none md:-translate-y-8" : "md:mt-6",
              )}
            >
              <figure>
                <Phone screen={screen} />
                <figcaption className="mt-5 px-2 text-center">
                  <span className="block font-bold">{screen.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{screen.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0 md:hidden" />
        </ul>
      </Reveal>
      <p className="container-page mt-4 text-center text-xs text-muted">
        Amafoto nyayo y’urubuga; amakuru ari kuri yo ni ay’urugero.
      </p>
    </section>
  );
}
