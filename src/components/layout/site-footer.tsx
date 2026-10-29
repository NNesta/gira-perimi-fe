import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { getOverview } from "@/lib/overview";
import { TextSizeControl } from "@/components/theme/text-size-control";
import { ThemeSegmented } from "@/components/theme/theme-toggle";

const COLUMNS = [
  {
    title: "Kwiga",
    links: [
      { href: "/amasomo", label: "Amasomo" },
      { href: "/ibyapa", label: "Ibyapa byo ku muhanda" },
      { href: "/imyitozo", label: "Imyitozo" },
      { href: "/ikizamini", label: "Ikizamini cy’igerageza" },
    ],
  },
  {
    title: "Konti yanjye",
    links: [
      { href: "/injira", label: "Injira / Iyandikishe" },
      { href: "/ikibaho", label: "Ikibaho cyanjye" },
      { href: "/ibizamini", label: "Ibizamini nakoze" },
      { href: "/umwirondoro", label: "Umwirondoro" },
    ],
  },
  {
    title: "Amakuru",
    links: [
      { href: "/#uko-bikora", label: "Uko Tsinda Neza ikora" },
      { href: "/#ibibazo-bikunze-kubazwa", label: "Ibibazo bikunze kubazwa" },
      { href: "/amasomo/itegeko-rishya-2026", label: "Itegeko rishya rya 2026" },
    ],
  },
];

export async function SiteFooter() {
  const { audio_credit: audioCredit } = await getOverview();
  return (
    <footer className="mt-24 border-t border-line bg-surface pb-24 lg:pb-0">
      <div className="h-1.5 bg-[linear-gradient(90deg,#00a1de_0_50%,#fad201_50%_75%,#20603d_75%)]" aria-hidden />
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 leading-relaxed text-muted">
            Iga amategeko y’umuhanda mu Kinyarwanda, witoze ibibazo by’ikizamini nyirizina, maze ugire perimi ku
            nshuro ya mbere.
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-muted">Amabara y’urubuga</p>
          <ThemeSegmented className="mt-2" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-muted">Ingano y’inyandiko</p>
          <TextSizeControl className="mt-2" />
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted transition hover:text-brand-600 dark:hover:text-brand-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Tsinda Neza. Uburenganzira bwose burasigasiwe.
            {/* The voice's licence (CC BY) asks for this credit wherever the clips are used. */}
            {audioCredit && <span className="mt-1 block text-xs">{audioCredit}</span>}
          </p>
          <p className="max-w-2xl md:text-right">
            Tsinda Neza si urubuga rwa Polisi y’u Rwanda. Ibibazo n’amasomo bishingiye ku gitabo cy’ibibazo
            by’ikizamini, Iteka rya Perezida n° 85/01 n’Itegeko n° 014/2026 rigenga ikoreshwa ry’umuhanda.
          </p>
        </div>
      </div>
    </footer>
  );
}
