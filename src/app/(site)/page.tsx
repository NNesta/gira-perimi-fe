/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChartLine,
  CircleCheck,
  ClipboardCheck,
  Gift,
  Layers,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { Suspense } from "react";

import { ProductScreens } from "@/components/home/product-screens";
import { RealResults } from "@/components/home/real-results";
import { HeroScene } from "@/components/illustrations/hero-scene";
import { DemoQuiz } from "@/components/quiz/demo-quiz";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/api-server";
import { formatScore } from "@/lib/format";
import { getOverview } from "@/lib/overview";
import type { Overview } from "@/lib/types";

function Counts({ questions, lessons, signs }: Pick<Overview, "questions" | "lessons" | "signs">) {
  const items = [
    { value: questions, label: "Ibibazo by’ikizamini" },
    { value: lessons, label: "Amasomo asobanutse" },
    { value: signs, label: "Ibyapa n’ibimenyetso" },
    { value: "0 Frw", label: "Ni ubuntu ubu" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="sr-only">{item.label}</dt>
          <dd className="font-display text-3xl font-extrabold sm:text-4xl">{item.value}</dd>
          <dd className="mt-1 text-sm font-medium text-muted">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Iyo umaze gukora ibizamini birenga 10 kandi impuzandengo y’ibizamini 10 biheruka ikarenga 15/20" */
function readinessRule({ exam }: Overview): string {
  return (
    `Iyo umaze gukora ibizamini by’igerageza birenga ${exam.readiness_min_exams} kandi impuzandengo y’ibizamini ` +
    `${exam.readiness_recent_exams} biheruka ikarenga ${formatScore(exam.readiness_min_average)}/20`
  );
}

const steps = (o: Overview) => [
  {
    icon: BookOpen,
    title: "Iga",
    text: `Soma amasomo ${o.lessons} yanditse mu Kinyarwanda cyoroshye, ashingiye ku mategeko nyayo y’umuhanda.`,
    tone: "bg-ocean-500",
  },
  {
    icon: Target,
    title: "Witoze",
    text: "Subiza ibibazo by’ikizamini nyirizina ukurikije ibice, urebe ako kanya igisubizo cy’ukuri.",
    tone: "bg-brand-500",
  },
  {
    icon: Timer,
    title: "Kora ibizamini",
    text: `Ibizamini by’igerageza bimeze nk’ibya Polisi: ibibazo ${o.exam.question_count} bisubizwa mu minota ${o.exam.duration_minutes}.`,
    tone: "bg-sun-400",
  },
  {
    icon: Trophy,
    title: "Tsinda",
    text: `${readinessRule(o)}, turakubwira ko witeguye.`,
    tone: "bg-signal-500",
  },
];

const features = (o: Overview) => [
  {
    icon: ClipboardCheck,
    title: "Ikizamini kimeze nk’icya nyacyo",
    text: `Isaha ibara iminota ${o.exam.duration_minutes}, ibibazo ${o.exam.question_count} bitoranywa ku buryo butunguranye, amanota ${o.exam.pass_mark} kugira ngo utsinde. Ikizamini kirangira ubwacyo iyo igihe kirangiye.`,
    className: "md:col-span-2",
  },
  {
    icon: ChartLine,
    title: "Kurikirana aho ugeze",
    text: "Impuzandengo yawe, amanota yawe meza, n’ibice ukwiye kongeramo imbaraga.",
  },
  {
    icon: Layers,
    title: "Ibyapa byose",
    text: `Ibyapa ${o.signs} by’iteka rigenga umuhanda, n’amakarita yo kubifata mu mutwe.`,
  },
  {
    icon: BadgeCheck,
    title: "Ibibazo nyabyo",
    text: `Ibibazo ${o.questions} byo mu gitabo cy’ibibazo by’ikizamini, uko byakabaye, n’amashusho yabyo.`,
  },
  {
    icon: Smartphone,
    title: "Kuri telefone no kuri mudasobwa",
    text: "Wiga aho uri hose: urubuga rukora neza kuri telefone, tablet na mudasobwa.",
  },
  {
    icon: Gift,
    title: "Ubuntu",
    text: "Ubu ibintu byose ni ubuntu. Iyandikishe ukoresheje Gmail cyangwa imeyili yawe mu masegonda make.",
    className: "md:col-span-3",
  },
];

const MARQUEE_SIGNS = [
  "b-2a", "a-1a", "c-14", "d-3", "b-1", "a-10", "c-1", "e-11", "a-25", "c-12", "d-1a-4", "b-3",
  "a-15", "c-18", "e-20", "a-7", "c-13a", "a-27", "d-4", "e-13a",
];

const faq = (o: Overview) => [
  {
    q: "Tsinda Neza ni iki?",
    a: "Ni urubuga rugufasha kwiga amategeko y’umuhanda mu Kinyarwanda no kwitegura ikizamini cy’uruhushya rw’agateganyo rwo gutwara ibinyabiziga, ukoresheje amasomo, ibyapa, imyitozo n’ibizamini by’igerageza.",
  },
  {
    q: "Ese ibibazo ni ibyo mu kizamini nyakuri?",
    a: "Ibibazo biri kuri Tsinda Neza byavanywe mu gitabo cy’ibibazo by’ikizamini uko byakabaye, hamwe n’ibisubizo byabyo n’amashusho yabyo. Amasomo ashingiye ku Iteka rya Perezida rigenga uburyo bwo kugenda mu muhanda no ku Itegeko n° 014/2026.",
  },
  {
    q: "Ikizamini cy’igerageza giteye gite?",
    a: `Ni kimwe n’icya Polisi: ibibazo ${o.exam.question_count} bisubizwa mu minota ${o.exam.duration_minutes}, kandi ugomba kubona nibura ${o.exam.pass_mark}/${o.exam.question_count} (${Math.round((o.exam.pass_mark / o.exam.question_count) * 100)}%) kugira ngo utsinde. Iyo igihe kirangiye, ikizamini kirifunga kikabara ibisubizo wari umaze gutanga.`,
  },
  {
    q: "Nzamenya nte ko niteguye kujya gukora ikizamini?",
    a: `${readinessRule(o)}, ikibaho cyawe kikwereka ko witeguye kandi tukakugira inama yo kwiyandikisha ku kizamini nyirizina. Ibizamini wavuyemo igihe kigashira utarasubiza nibura kimwe cya kabiri cy’ibibazo ntibibarwa.`,
  },
  {
    q: "Ese birishyurwa?",
    a: "Ubu ibintu byose ni ubuntu. Mu gihe kizaza, hashobora kuzashyirwaho ifatabuguzi rito kugira ngo urubuga rukomeze gutera imbere.",
  },
  {
    q: "Niyandikisha nte?",
    a: "Kanda kuri “Injira”, uhitemo konti yawe ya Gmail (Google). Niba utazi ijambobanga rya Gmail yawe cyangwa udafite Gmail, hitamo “Injira ukoresheje imeyili”: tukoherereza link, ukayikanda ukinjira. Ubwa mbere bigufungurira konti, ubutaha bikwinjiza ako kanya.",
  },
];

/** Hero buttons: a signed-in learner is sent back to their dashboard instead of being asked to sign up. */
async function HeroActions() {
  const user = await getSessionUser();
  return (
    <>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        {user ? (
          <ButtonLink href="/ikibaho" size="lg">
            Komeza kwiga <ArrowRight className="size-5" />
          </ButtonLink>
        ) : (
          <ButtonLink href="/injira" size="lg">
            Tangira ku buntu <ArrowRight className="size-5" />
          </ButtonLink>
        )}
        <ButtonLink href="#gerageza" variant="secondary" size="lg">
          Gerageza ibibazo 5
        </ButtonLink>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <CircleCheck className="size-4 text-brand-500" />
        {user
          ? `Murakaza neza, ${user.given_name || user.name.split(" ")[0]}! Komeza aho wari ugeze.`
          : "Iyandikishe ukoresheje Gmail cyangwa imeyili yawe, mu masegonda make."}
      </p>
    </>
  );
}

function HeroActionsSkeleton() {
  return (
    <>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-14 rounded-2xl sm:w-56" />
        <Skeleton className="h-14 rounded-2xl sm:w-56" />
      </div>
      <Skeleton className="mt-4 h-5 w-72 max-w-full" />
    </>
  );
}

/** Closing call to action, worded for whether the visitor already has an account. */
async function FinalActions() {
  const user = await getSessionUser();
  return (
    <>
      <p className="mt-4 text-lg text-white/85">
        {user ? "Komeza wige" : "Iyandikishe uyu munsi, wige"} iminota 15 ku munsi, maze ugere ku munsi w’ikizamini
        wizeye intsinzi.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {user ? (
          <ButtonLink href="/ikibaho" variant="sun" size="lg">
            Jya ku kibaho cyanjye <ArrowRight className="size-5" />
          </ButtonLink>
        ) : (
          <ButtonLink href="/injira" variant="sun" size="lg">
            Iyandikishe ku buntu <ArrowRight className="size-5" />
          </ButtonLink>
        )}
        <ButtonLink
          href="/amasomo"
          size="lg"
          className="bg-white/15 from-transparent to-transparent shadow-none ring-1 ring-white/30 hover:bg-white/25"
        >
          {user ? "Reba amasomo" : "Banza urebe amasomo"}
        </ButtonLink>
      </div>
    </>
  );
}

function FinalActionsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mx-auto mt-4 h-14 max-w-xl rounded-xl bg-white/15" />
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <div className="h-14 rounded-2xl bg-white/15 sm:w-64" />
        <div className="h-14 rounded-2xl bg-white/15 sm:w-56" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const overview = await getOverview();
  const { exam } = overview;
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div
          aria-hidden
          className="absolute -left-40 top-10 size-[30rem] rounded-full bg-gradient-to-br from-brand-300/35 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-32 -top-20 size-[28rem] rounded-full bg-gradient-to-bl from-ocean-300/35 to-transparent blur-3xl"
        />
        <div className="container-page relative grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
          <div>
            <div className="enter enter-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1.5 text-sm font-semibold text-brand-700 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-300">
                <Sparkles className="size-4" /> Amategeko y’umuhanda mu Kinyarwanda
              </p>
            </div>
            <div className="enter enter-2">
              <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.04] sm:text-6xl lg:text-[4.1rem]">
                Iga amategeko y’umuhanda, <span className="text-gradient">utsinde ikizamini</span> cya perimi.
              </h1>
            </div>
            <div className="enter enter-3">
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                Amasomo asobanutse, ibyapa byose, n’ibibazo by’ikizamini nyirizina. Witoze nk’uko bigenda kwa
                Polisi: ibibazo {exam.question_count} mu minota {exam.duration_minutes}, ukurikirane aho ugeze kugeza
                witeguye.
              </p>
            </div>
            <div className="enter enter-4">
              <Suspense fallback={<HeroActionsSkeleton />}>
                <HeroActions />
              </Suspense>
            </div>
            <div className="enter enter-5 mt-12 border-t border-line pt-8">
              <Counts {...overview} />
            </div>
          </div>
          <div className="enter enter-3">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ sources strip */}
      <section className="border-y border-line bg-surface">
        <div className="container-page flex flex-col items-center gap-3 py-6 text-center text-sm font-semibold text-muted md:flex-row md:justify-between md:text-left">
          <span className="text-ink">Bishingiye ku nyandiko zemewe:</span>
          <span>Igitabo cy’ibibazo by’ikizamini</span>
          <span className="hidden size-1.5 rounded-full bg-line md:block" />
          <span>Iteka rya Perezida n° 85/01 rigenga umuhanda</span>
          <span className="hidden size-1.5 rounded-full bg-line md:block" />
          <span>Itegeko n° 014/2026 ryo ku wa 06/03/2026</span>
        </div>
      </section>

      {/* ------------------------------------------------------------ the product, on a phone */}
      <ProductScreens />

      {/* ------------------------------------------------------------ how it works */}
      <section id="uko-bikora" className="container-page scroll-mt-24 py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Uko bikora"
            title="Intambwe enye zikugeza kuri perimi"
            description="Kuva ku isomo rya mbere kugeza ku munsi w’ikizamini, Tsinda Neza iragukurikirana intambwe ku yindi."
          />
        </Reveal>
        <ol className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-9 hidden h-[3px] bg-[repeating-linear-gradient(90deg,var(--color-sun-300)_0_18px,transparent_18px_34px)] lg:block"
          />
          {steps(overview).map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="card relative h-full p-6">
                <span className={`grid size-[4.5rem] place-items-center rounded-3xl text-white shadow-lift ${step.tone}`}>
                  <step.icon className="size-8" />
                </span>
                <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-surface-2">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ demo quiz */}
      <section id="gerageza" className="scroll-mt-20 bg-gradient-to-b from-surface to-bg py-20 sm:py-28">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Isuzume nonaha"
              title="Ibibazo 5 by’ikizamini, nta kwiyandikisha"
              description="Ibi bibazo bitoranyijwe ku buryo butunguranye mu bibazo by’ikizamini nyirizina. Hitamo igisubizo, uhite ubona niba ari cyo."
            />
            <ul className="mt-8 space-y-3 text-ink-soft">
              {["Ibibazo n’amashusho uko biri mu kizamini", "Igisubizo cy’ukuri kigaragara ako kanya", "Ukomeza kuri konti yawe ubike aho ugeze"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CircleCheck className="size-5 shrink-0 text-brand-500" /> {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <DemoQuiz />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ features */}
      <section className="container-page py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Impamvu Tsinda Neza"
            title="Byose ukeneye kugira ngo utsinde, ahantu hamwe"
          />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features(overview).map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.06} className={feature.className}>
              <div className="card group h-full p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-ocean-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:scale-110 dark:from-brand-500/15 dark:to-ocean-500/10 dark:text-brand-300 dark:ring-brand-400/20">
                  <feature.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{feature.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ exam format */}
      <section className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-asphalt px-6 py-14 text-white sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-6 h-2 bg-[repeating-linear-gradient(90deg,#fad201_0_44px,transparent_44px_80px)] opacity-30"
            />
            <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-sun-300">Ikizamini cy’uruhushya rw’agateganyo</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">Menya uko ikizamini giteye mbere y’umunsi nyirizina</h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
                  Ibizamini by’igerageza bya Tsinda Neza bikurikiza imiterere imwe n’iy’ikizamini gikoreshwa na Polisi
                  y’u Rwanda, kugira ngo ku munsi w’ikizamini nta kintu kigutungura.
                </p>
                <ButtonLink href="/ikizamini" variant="sun" size="lg" className="mt-8">
                  Kora ikizamini cy’igerageza <ArrowRight className="size-5" />
                </ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-5">
                {[
                  { value: String(exam.question_count), label: "Ibibazo" },
                  { value: `${exam.duration_minutes}′`, label: "Iminota" },
                  { value: String(exam.pass_mark), label: "Amanota yo gutsinda" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur sm:p-7">
                    <p className="font-display text-4xl font-extrabold text-sun-300 sm:text-6xl">{item.value}</p>
                    <p className="mt-2 text-xs font-semibold text-white/70 sm:text-sm">{item.label}</p>
                  </div>
                ))}
                <div className="col-span-3 rounded-3xl border border-brand-400/30 bg-brand-500/15 p-5 sm:p-6">
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-white/90 sm:text-base">
                    <Trophy className="mt-0.5 size-5 shrink-0 text-sun-300" />
                    {readinessRule(overview)}, ikibaho cyawe kikubwira ko witeguye kujya gukora ikizamini nyirizina.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ signs marquee */}
      <section className="py-20 sm:py-28">
        <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Ibyapa byo ku muhanda"
              title={`Ibyapa ${overview.signs}, buri kimwe n’igisobanuro cyacyo`}
              description="Ibyapa biburira, ibibuza, ibitegeka, ibiyobora n’imirongo yo mu muhanda, byose uko biri mu iteka rigenga umuhanda."
            />
          </Reveal>
          <ButtonLink href="/ibyapa" variant="secondary" className="shrink-0">
            Reba ibyapa byose <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
        <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
            {[...MARQUEE_SIGNS, ...MARQUEE_SIGNS].map((id, i) => (
              <div key={`${id}-${i}`} className="paper flex size-28 shrink-0 items-center justify-center border border-line p-3 shadow-soft sm:size-32">
                <img src={`/media/signs/${id}.webp`} alt="" className="max-h-20 max-w-full object-contain sm:max-h-24" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ real results (only once there are some) */}
      <Suspense fallback={null}>
        <RealResults />
      </Suspense>

      {/* ------------------------------------------------------------ FAQ */}
      <section id="ibibazo-bikunze-kubazwa" className="container-page scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Ibibazo bikunze kubazwa"
              title="Ibyo abantu benshi batubaza"
              description="Ntubonye igisubizo cy’ikibazo cyawe? Tangira wiga, amasomo menshi arasubiza ibibazo bya buri munsi."
            />
          </Reveal>
          <div className="space-y-3">
            {faq(overview).map((item, i) => (
              <Reveal key={item.q} delay={i * 0.04}>
                <details className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-bold sm:p-6">
                    {item.q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xl transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-6 leading-relaxed text-muted sm:px-6">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ final CTA */}
      <section className="container-page mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 via-brand-600 to-ocean-600 px-6 py-16 text-center text-white shadow-glow sm:px-12">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Perimi yawe itangirira hano.</h2>
              <Suspense fallback={<FinalActionsSkeleton />}>
                <FinalActions />
              </Suspense>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
