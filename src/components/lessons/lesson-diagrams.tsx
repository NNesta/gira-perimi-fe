// Drawings inside lessons (`::diagram name` in the lesson Markdown). Every figure says in text what it shows, and the
// numbers come from the lesson itself; the stopping distances are a worked example and say so.

import type { ReactNode } from "react";

import { Car, Truck } from "@/components/scenarios/vehicles";
import { cn } from "@/lib/cn";

const ASPHALT = "#3d4452";
const GRASS = "#cfe7c3";
const PAVEMENT = "#ddd6c8";
const YES = "#129b68";
const NO = "#e5484d";
const LONG = "#f59e0b";
const RED_CAR = { body: "#e5484d", edge: "#a51d24" };
const BLUE_CAR = { body: "#1a8fe0", edge: "#0b5d99" };

function Figure({ title, children, notes }: { title: string; children: ReactNode; notes?: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="bg-surface-2 p-3 sm:p-5">{children}</div>
      <figcaption className="p-4 text-sm leading-relaxed text-ink-soft sm:p-5">
        <p className="text-base font-bold text-ink">{title}</p>
        {notes && <div className="mt-2">{notes}</div>}
      </figcaption>
    </figure>
  );
}

function Verdict({ x, y, ok }: { x: number; y: number; ok: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={17} fill={ok ? YES : NO} stroke="#ffffff" strokeWidth={3} />
      {ok ? (
        <path d="M-7 0 L-2 5 L8 -6" fill="none" stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" />
      )}
    </g>
  );
}

function ArrowHead({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX={5} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  );
}

// ------------------------------------------------------------------------------------------- lane markings (lesson 5)

type LineKind = "solid" | "dashed";
const LANE_PANELS: { lines: LineKind[]; ok: boolean; label: string }[] = [
  { lines: ["solid"], ok: false, label: "Udacagaguye: ntukawurenge." },
  { lines: ["dashed"], ok: true, label: "Ucagaguye: urawurenga unyuranaho, ukatira ibumoso cyangwa uhindukira." },
  { lines: ["solid", "dashed"], ok: true, label: "Ibangikanye, ucagaguye ku ruhande rwawe: urarenga." },
  { lines: ["dashed", "solid"], ok: false, label: "Ibangikanye, udacagaguye ku ruhande rwawe: ntukarenge." },
];

function LanePanel({ lines, ok, index }: { lines: LineKind[]; ok: boolean; index: number }) {
  const xs = lines.length === 1 ? [100] : [94, 106];
  const color = ok ? YES : NO;
  const marker = `lane-arrow-${index}`;
  return (
    <svg viewBox="0 0 200 250" className="block h-auto w-full rounded-2xl" role="img" aria-label={LANE_PANELS[index].label}>
      <defs>
        <ArrowHead id={marker} color={color} />
      </defs>
      <rect width={200} height={250} fill={GRASS} />
      <rect x={30} width={140} height={250} fill={ASPHALT} />
      <path d="M34 0 V250 M166 0 V250" stroke="#ffffff" strokeWidth={2.5} opacity={0.9} />
      {lines.map((kind, i) => (
        <path key={i} d={`M${xs[i]} 0 V250`} stroke="#ffffff" strokeWidth={4} strokeDasharray={kind === "dashed" ? "18 14" : undefined} />
      ))}
      <path
        d="M134 170 C134 130 66 120 66 72"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray="8 6"
        strokeLinecap="round"
        markerEnd={`url(#${marker})`}
      />
      <g transform="translate(134 198)">
        <Car {...RED_CAR} />
      </g>
      <Verdict x={66} y={36} ok={ok} />
    </svg>
  );
}

function LaneMarkings() {
  return (
    <Figure title="Imirongo itandukanya ibyerekezo" notes={<p>Iyo imirongo ibiri ibangikanye, wita gusa ku umwegereye.</p>}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LANE_PANELS.map((panel, i) => (
          <div key={i}>
            <LanePanel lines={panel.lines} ok={panel.ok} index={i} />
            <p className="mt-2 text-xs font-semibold leading-snug text-ink-soft sm:text-sm">{panel.label}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ------------------------------------------------------------------------------------------------ overtaking (lesson 8)

function StepNumber({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={15} fill="#0f172a" stroke="#ffffff" strokeWidth={2.5} />
      <text y={5.5} textAnchor="middle" fontSize={16} fontWeight={800} fill="#ffffff" fontFamily="Arial, sans-serif">
        {n}
      </text>
    </g>
  );
}

function Overtaking() {
  return (
    <Figure
      title="Uko unyuranaho"
      notes={
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Reba mu ndorerwamo n’imbere: igisate cy’ibumoso kigomba kuba kirimo ubusa mu ntera ihagije. Tanga ikimenyetso cy’ibumoso.</li>
          <li>
            Nyura <strong>ibumoso</strong> bw’ikinyabiziga, usige nibura <strong>cm 50</strong> (metero 1 ku munyamaguru, ku
            kinyamitende no ku nyamaswa).
          </li>
          <li>Garuka iburyo utabangamiye uwo unyuzeho. Unyurwaho yegera iburyo kandi ntiyongera umuvuduko.</li>
        </ol>
      }
    >
      <svg viewBox="0 0 640 230" className="block h-auto w-full rounded-2xl" role="img" aria-label="Imodoka inyura ku ikamyo ibumoso, hanyuma igaruka iburyo">
        <defs>
          <ArrowHead id="overtake-arrow" color={YES} />
        </defs>
        <rect width={640} height={230} fill={GRASS} />
        <rect y={40} width={640} height={140} fill={ASPHALT} />
        <path d="M0 43 H640 M0 177 H640" stroke="#ffffff" strokeWidth={2.5} opacity={0.9} />
        <path d="M0 110 H640" stroke="#ffffff" strokeWidth={3.5} strokeDasharray="22 16" />
        <path d="M600 92 L620 110 L600 128" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.5} />

        <path
          d="M150 145 C215 145 215 75 280 75 H410 C475 75 475 145 540 145 H575"
          fill="none"
          stroke={YES}
          strokeWidth={4}
          strokeDasharray="9 7"
          strokeLinecap="round"
          markerEnd="url(#overtake-arrow)"
        />
        <g transform="translate(345 145) rotate(90)">
          <Truck />
        </g>
        <g transform="translate(110 145) rotate(90)" opacity={0.55}>
          <Car {...RED_CAR} />
        </g>
        <circle cx={128} cy={130} r={4} fill="#fbbf24">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <g transform="translate(345 75) rotate(90)">
          <Car {...RED_CAR} />
        </g>
        <g transform="translate(590 145) rotate(90)" opacity={0.55}>
          <Car {...RED_CAR} />
        </g>

        <path d="M393 92 V126" stroke="#fad201" strokeWidth={2.5} />
        <path d="M386 92 H400 M386 127 H400" stroke="#fad201" strokeWidth={2.5} />
        <g transform="translate(404 116)">
          <rect x={0} y={-15} width={88} height={22} rx={6} fill="#0f172a" opacity={0.85} />
          <text x={44} y={1} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fad201" fontFamily="Arial, sans-serif">
            ≥ cm 50
          </text>
        </g>

        <StepNumber x={110} y={206} n={1} />
        <StepNumber x={345} y={20} n={2} />
        <StepNumber x={590} y={206} n={3} />
      </svg>
    </Figure>
  );
}

// -------------------------------------------------------------------------------------- stopping distance (lesson 9)

const SPEEDS = [40, 50, 60, 80];
const REACTION_SECONDS = 1;
const DRY_FRICTION = 0.7;
const GRAVITY = 9.81;

/** Reaction distance (1 s) plus braking distance on a dry road, rounded to the metre. */
const STOPPING = SPEEDS.map((kmh) => {
  const ms = kmh / 3.6;
  const reaction = Math.round(ms * REACTION_SECONDS);
  const braking = Math.round((ms * ms) / (2 * DRY_FRICTION * GRAVITY));
  return { kmh, reaction, braking, total: reaction + braking };
});
const LONGEST = Math.max(...STOPPING.map((s) => s.total));

function StoppingDistance() {
  return (
    <Figure
      title="Intera ikinyabiziga gikenera kugira ngo gihagarare (urugero)"
      notes={
        <>
          <p>
            Urugero rubariwe: umuyobozi akenera nk’<strong>isegonda 1</strong> kugira ngo abone inkomyi atangire gufata feri,
            ku muhanda wumutse. Iyo umuhanda utose, intera ya feri irikuba hafi kabiri.
          </p>
          <p className="mt-1.5">
            <strong>Inama:</strong> siga hagati yawe n’ikikuri imbere nibura amasegonda 2, kandi ugendere ku muvuduko
            ugufasha guhagarara mu ntera ureba.
          </p>
        </>
      }
    >
      <div className="rounded-2xl bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded bg-sun-400" aria-hidden /> Kubona no gufata icyemezo
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded bg-signal-500" aria-hidden /> Feri
          </span>
        </div>
        <ul className="space-y-3">
          {STOPPING.map((row) => (
            <li key={row.kmh} className="grid grid-cols-[4.5rem_1fr_3.25rem] items-center gap-3">
              <span className="text-sm font-bold tabular-nums">km {row.kmh}/h</span>
              <span className="flex h-7 overflow-hidden rounded-lg bg-surface-2" aria-label={`metero ${row.reaction} na metero ${row.braking}`}>
                <span
                  className="grid place-items-center bg-sun-400 text-[0.7rem] font-bold text-asphalt"
                  style={{ width: `${(row.reaction / LONGEST) * 100}%` }}
                >
                  {row.reaction}
                </span>
                <span
                  className="grid place-items-center bg-signal-500 text-[0.7rem] font-bold text-white"
                  style={{ width: `${(row.braking / LONGEST) * 100}%` }}
                >
                  {row.braking}
                </span>
              </span>
              <span className="text-right text-sm font-extrabold tabular-nums">m {row.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}

// ----------------------------------------------------------------------------------------- where not to stop (lesson 10)

const ZONES: { from: number; to: number; color: string; label?: string }[] = [
  { from: 90, to: 172, color: NO, label: "m 10" },
  { from: 172, to: 330, color: YES },
  { from: 330, to: 380, color: NO, label: "m 5" },
  { from: 430, to: 520, color: YES },
  { from: 520, to: 680, color: LONG, label: "m 15 · m 15" },
  { from: 680, to: 720, color: YES },
];

function Parking() {
  return (
    <Figure
      title="Aho utahagarara"
      notes={
        <>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded" style={{ background: NO }} aria-hidden /> Ntuhahagarare na gato
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded" style={{ background: LONG }} aria-hidden /> Ntuhahagarare umwanya munini
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded" style={{ background: YES }} aria-hidden /> Ushobora kuhahagarara
            </li>
          </ul>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Muri m 10 y’amasangano no muri m 5 mbere y’inzira y’abanyamaguru: ntuhahagarare.</li>
            <li>Muri m 15 imbere n’inyuma y’aho bisi zihagarara: ntuhahagarare umwanya munini.</li>
            <li>Hagarara iburyo, ubangikanye n’inkombe, utarenze cm 50 uvuye ku kayira.</li>
          </ul>
        </>
      }
    >
      <svg viewBox="0 0 720 250" className="block h-auto w-full rounded-2xl" role="img" aria-label="Umuhanda ugaragaza aho guhagarara bibujijwe">
        <rect width={720} height={250} fill={GRASS} />
        <rect x={90} y={22} width={630} height={28} fill={PAVEMENT} />
        <rect x={90} y={190} width={630} height={30} fill={PAVEMENT} />
        <rect width={90} height={250} fill={ASPHALT} />
        <rect x={90} y={50} width={630} height={140} fill={ASPHALT} />
        <path d="M45 0 V250" stroke="#ffffff" strokeWidth={3} strokeDasharray="16 12" />
        <path d="M100 120 H720" stroke="#ffffff" strokeWidth={3} strokeDasharray="20 14" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={380} y={56 + i * 19} width={50} height={10} fill="#ffffff" />
        ))}

        {ZONES.map((zone) => (
          <g key={zone.from}>
            <rect x={zone.from} y={157} width={zone.to - zone.from} height={31} fill={zone.color} opacity={0.42} />
            <path d={`M${zone.from} 157 H${zone.to}`} stroke={zone.color} strokeWidth={3} />
            {zone.label && (
              <g transform={`translate(${(zone.from + zone.to) / 2} 143)`}>
                <rect x={-zone.label.length * 5 - 10} y={-13} width={zone.label.length * 10 + 20} height={24} rx={7} fill={zone.color} />
                <text y={4} textAnchor="middle" fontSize={15} fontWeight={800} fill="#ffffff" fontFamily="Arial, sans-serif">
                  {zone.label}
                </text>
              </g>
            )}
          </g>
        ))}

        <g transform="translate(250 173) rotate(90)">
          <Car {...BLUE_CAR} />
        </g>
        <Verdict x={250} y={222} ok />
        <g transform="translate(475 173) rotate(90)">
          <Car {...BLUE_CAR} />
        </g>
        <Verdict x={475} y={222} ok />

        <g transform="translate(600 205)">
          <rect x={-2} y={-18} width={4} height={30} fill="#64748b" />
          <rect x={-22} y={-44} width={44} height={28} rx={5} fill="#1565c0" stroke="#ffffff" strokeWidth={2} />
          <text y={-25} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ffffff" fontFamily="Arial, sans-serif">
            BISI
          </text>
        </g>
        <g transform="translate(160 85) rotate(-90)">
          <Car {...RED_CAR} />
        </g>
      </svg>
    </Figure>
  );
}

const DIAGRAMS: Record<string, () => ReactNode> = {
  imirongo: LaneMarkings,
  kunyuranaho: Overtaking,
  "intera-yo-guhagarara": StoppingDistance,
  "aho-guhagarara": Parking,
};

export function LessonDiagram({ name, className }: { name: string; className?: string }) {
  const Drawing = DIAGRAMS[name];
  if (!Drawing) return null; // a drawing this version of the site does not have yet
  return (
    <div className={cn("my-2", className)}>
      <Drawing />
    </div>
  );
}
