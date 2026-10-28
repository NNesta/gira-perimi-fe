"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Car } from "@/components/scenarios/vehicles";
import {
  ARROW,
  COLORS,
  DRIVE,
  MOVE_LABEL,
  ROTATION,
  START,
  rotate,
  type Approach,
  type Light,
  type Scenario,
  type SignKind,
  type Vehicle,
} from "@/lib/scenarios";

const ASPHALT = "#3d4452";
const GRASS = "#cfe7c3";
const DIRT = "#c9a46c";
const ARMS: Approach[] = ["s", "w", "n", "e"];
const TREES = [
  [58, 66, 20],
  [104, 34, 13],
  [336, 58, 17],
  [368, 104, 12],
  [52, 336, 16],
  [100, 372, 11],
  [346, 344, 19],
  [304, 378, 10],
] as const;

const DELAY_MS = 450; // let the learner see the marks before the vehicles move
const DURATION_MS = 1700;
const GAP_MS = 950;

type Pose = { x: number; y: number; angle: number };
export type Mark = { tone: "pick" | "right" | "wrong"; label?: string };

const MARK_STROKE: Record<Mark["tone"], string> = { pick: "#0f172a", right: "#129b68", wrong: "#e5484d" };

function restingPose(v: Vehicle): Pose {
  return v.custom ? { x: v.custom.x, y: v.custom.y, angle: v.custom.angle } : { x: START.x, y: START.y, angle: 0 };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function Ambulance() {
  return (
    <>
      <rect x={-14} y={-25} width={32} height={56} rx={8} fill="rgba(15,23,42,0.22)" />
      <rect x={-15} y={-28} width={30} height={56} rx={7} fill="#ffffff" stroke="#9aa4b2" strokeWidth={1.5} />
      <path d="M-11 -17 Q0 -21 11 -17 L10 -11 L-10 -11 Z" fill="#dff1fb" />
      <rect x={-15} y={4} width={30} height={5} fill="#e5484d" />
      <rect x={-2.5} y={12} width={5} height={13} rx={1} fill="#e5484d" />
      <rect x={-6.5} y={16} width={13} height={5} rx={1} fill="#e5484d" />
      <rect x={-11} y={-8} width={10} height={5} rx={2} fill="#1d6fe8">
        <animate attributeName="opacity" values="1;0.25;1" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <rect x={1} y={-8} width={10} height={5} rx={2} fill="#1d6fe8">
        <animate attributeName="opacity" values="0.25;1;0.25" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <g stroke="#1d6fe8" strokeWidth={2} fill="none" strokeLinecap="round">
        <path d="M-9 -36 Q0 -42 9 -36">
          <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" />
        </path>
        <path d="M-14 -43 Q0 -51 14 -43">
          <animate attributeName="opacity" values="0;1;0" dur="1.1s" begin="0.35s" repeatCount="indefinite" />
        </path>
      </g>
    </>
  );
}

function Sign({ kind }: { kind: SignKind }) {
  const shadow = <ellipse cx={2} cy={17} rx={11} ry={3.5} fill="rgba(15,23,42,0.25)" />;
  if (kind === "stop") {
    const points = Array.from({ length: 8 }, (_, i) => {
      const a = ((22.5 + i * 45) * Math.PI) / 180;
      return `${(15 * Math.cos(a)).toFixed(2)},${(15 * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    return (
      <>
        {shadow}
        <polygon points={points} fill="#d32f2f" stroke="#ffffff" strokeWidth={2} />
        <text y={2.8} textAnchor="middle" fontSize={8} fontWeight={800} fill="#ffffff" fontFamily="Arial, sans-serif">
          STOP
        </text>
      </>
    );
  }
  if (kind === "yield") {
    return (
      <>
        {shadow}
        <polygon points="-15,-12 15,-12 0,14" fill="#ffffff" stroke="#d32f2f" strokeWidth={4} strokeLinejoin="round" />
      </>
    );
  }
  if (kind === "priority") {
    return (
      <>
        {shadow}
        <rect x={-11} y={-11} width={22} height={22} transform="rotate(45)" fill="#ffffff" stroke="#334155" strokeWidth={1} />
        <rect x={-7} y={-7} width={14} height={14} transform="rotate(45)" fill="#f5c518" />
      </>
    );
  }
  return (
    <>
      {shadow}
      <circle r={15} fill="#1565c0" stroke="#ffffff" strokeWidth={2} />
      <g fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round">
        <path d="M5.6 -5.6 A8 8 0 0 0 -7.7 -2" />
        <path d="M-5.6 5.6 A8 8 0 0 0 7.7 2" />
      </g>
      <path d="M-10.3 -4.4 L-7.4 1.4 L-4.2 -3.6 Z M10.3 4.4 L7.4 -1.4 L4.2 3.6 Z" fill="#ffffff" />
    </>
  );
}

function TrafficLight({ state }: { state: Light }) {
  const lamp = (on: boolean, lit: string, dim: string) => (on ? lit : dim);
  return (
    <>
      <ellipse cx={2} cy={22} rx={9} ry={3} fill="rgba(15,23,42,0.25)" />
      <rect x={-8} y={-20} width={16} height={40} rx={5} fill="#1f2430" stroke="#0b0e14" strokeWidth={1} />
      <circle cy={-11} r={4.6} fill={lamp(state === "red", "#ff3b30", "#4a1d1d")} />
      <circle cy={0} r={4.6} fill="#4a3a12" />
      <circle cy={11} r={4.6} fill={lamp(state === "green", "#2fd16b", "#173a22")} />
      {state === "off" && <path d="M-11 -23 L11 23" stroke="#e5484d" strokeWidth={2.5} strokeLinecap="round" />}
    </>
  );
}

/** One right-of-way scene, drawn from above. Vehicles are tappable; `playKey` > 0 drives them off in order. */
export function Intersection({
  scenario,
  marks,
  onPick,
  playKey,
}: {
  scenario: Scenario;
  marks: Record<string, Mark>;
  onPick?: (id: string) => void;
  playKey: number;
}) {
  const uid = useId().replace(/:/g, "");
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  const [poses, setPoses] = useState<Record<string, Pose>>(() =>
    Object.fromEntries(scenario.vehicles.map((v) => [v.id, restingPose(v)])),
  );
  const { layout } = scenario;
  const arms = layout === "t" ? ARMS.filter((a) => a !== "n") : ARMS;
  const armStart = layout === "roundabout" ? 304 : 260;
  // Stop / give-way line across the incoming lane; signs and lights stand just beside it.
  const lineY = layout === "roundabout" ? 316 : 296;
  const playing = playKey > 0;

  useEffect(() => {
    const rest = Object.fromEntries(scenario.vehicles.map((v) => [v.id, restingPose(v)]));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- back to the starting positions for a new scene or replay
    setPoses(rest);
    if (!playKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const order =
      scenario.sequence ?? [...scenario.answer, ...scenario.vehicles.map((v) => v.id).filter((id) => !scenario.answer.includes(id))];
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const elapsed = now - started - DELAY_MS;
      const next = { ...rest };
      let running = false;
      order.forEach((id, i) => {
        const path = paths.current[id];
        if (!path) return;
        const t = Math.min(1, Math.max(0, (elapsed - i * GAP_MS) / DURATION_MS));
        if (t < 1) running = true;
        if (t === 0) return;
        const total = path.getTotalLength();
        const at = ease(t) * total;
        const p = path.getPointAtLength(at);
        const q = path.getPointAtLength(Math.min(total, at + 1));
        next[id] = { x: p.x, y: p.y, angle: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90 };
      });
      setPoses(next);
      if (running) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [scenario, playKey]);

  const keyPick = (id: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPick?.(id);
    }
  };

  return (
    <svg viewBox="0 0 400 400" className="block h-auto w-full select-none" role="group" aria-label="Isangano">
      <defs>
        {scenario.vehicles.map((v) => (
          <marker
            key={v.id}
            id={`${uid}-arrow-${v.id}`}
            viewBox="0 0 10 10"
            refX={5}
            refY={5}
            markerWidth={4.2}
            markerHeight={4.2}
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={v.kind === "ambulance" ? "#1d6fe8" : COLORS[v.id]?.body} />
          </marker>
        ))}
      </defs>

      <rect width={400} height={400} fill={GRASS} />
      {TREES.filter(([x, y]) => !(layout === "t" && y < 130 && x > 120 && x < 280)).map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x + 3} cy={y + 4} r={r} fill="rgba(15,23,42,0.12)" />
          <circle cx={x} cy={y} r={r} fill="#7cbf6b" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.55} fill="#94cf82" />
        </g>
      ))}
      {layout === "t" && (
        <g>
          <rect x={150} y={36} width={100} height={70} rx={4} fill="rgba(15,23,42,0.12)" transform="translate(4 4)" />
          <rect x={150} y={36} width={100} height={70} rx={4} fill="#efe3cf" />
          <path d="M150 36 L200 66 L250 36 Z M150 106 L200 76 L250 106 Z" fill="#d9c5a3" />
          <rect x={150} y={36} width={100} height={70} rx={4} fill="none" stroke="#c2ab86" strokeWidth={1.5} />
        </g>
      )}

      {/* Roads */}
      {arms.map((arm) => (
        <rect
          key={arm}
          x={140}
          y={200}
          width={120}
          height={200}
          transform={`rotate(${ROTATION[arm]} 200 200)`}
          fill={scenario.dirt === arm ? DIRT : ASPHALT}
        />
      ))}
      <rect x={140} y={140} width={120} height={120} fill={ASPHALT} />
      {layout === "roundabout" && (
        <>
          <circle cx={200} cy={200} r={104} fill={ASPHALT} />
          <circle cx={200} cy={200} r={104} fill="none" stroke="#ffffff" strokeWidth={2} strokeDasharray="10 9" opacity={0.75} />
          <circle cx={200} cy={200} r={50} fill="#a9d79a" stroke="#ffffff" strokeWidth={4} />
          <circle cx={200} cy={200} r={18} fill="#7cbf6b" />
          <circle cx={194} cy={194} r={9} fill="#94cf82" />
        </>
      )}

      {/* Markings, drawn for the south arm and turned to each arm */}
      {arms.map((arm) => {
        const dirt = scenario.dirt === arm;
        const sign = scenario.signs?.[arm];
        const light = scenario.lights?.[arm];
        return (
          <g key={arm} transform={`rotate(${ROTATION[arm]} 200 200)`}>
            {dirt ? (
              <g fill="#b58f57" opacity={0.7}>
                {[
                  [158, 290],
                  [222, 312],
                  [184, 346],
                  [242, 372],
                  [170, 388],
                ].map(([x, y]) => (
                  <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={5} ry={2.5} />
                ))}
              </g>
            ) : (
              <>
                <path d={`M143 ${armStart + 2} L143 400 M257 ${armStart + 2} L257 400`} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
                <path d={`M200 ${lineY - 24} L200 400`} stroke="#ffffff" strokeWidth={3} strokeDasharray="12 10" opacity={0.9} />
                {layout !== "roundabout" &&
                  Array.from({ length: 8 }, (_, i) => (
                    <rect key={i} x={146 + i * 14} y={266} width={7} height={20} fill="#ffffff" opacity={0.85} />
                  ))}
              </>
            )}
            {(sign === "stop" || light) && <path d={`M202 ${lineY} L258 ${lineY}`} stroke="#ffffff" strokeWidth={5} />}
            {(sign === "yield" || (layout === "roundabout" && !dirt)) && (
              <path d={`M202 ${lineY} L258 ${lineY}`} stroke="#ffffff" strokeWidth={4} strokeDasharray="7 5" />
            )}
          </g>
        );
      })}

      {/* Where each vehicle is going */}
      {scenario.vehicles.map((v) => {
        const arrow = v.custom?.arrow ?? ARROW[v.move];
        const color = v.kind === "ambulance" ? "#1d6fe8" : COLORS[v.id]?.body;
        return (
          <g
            key={v.id}
            transform={v.custom ? undefined : `rotate(${ROTATION[v.from]} 200 200)`}
            opacity={playing ? 0.2 : 1}
            style={{ transition: "opacity 300ms" }}
          >
            <path d={arrow} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
            <path
              d={arrow}
              stroke={color}
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="7 6"
              markerEnd={`url(#${uid}-arrow-${v.id})`}
            />
            <path
              ref={(el) => {
                paths.current[v.id] = el;
              }}
              d={v.custom?.drive ?? DRIVE[v.move]}
              fill="none"
              stroke="none"
            />
          </g>
        );
      })}

      {/* Vehicles */}
      {scenario.vehicles.map((v) => {
        const pose = poses[v.id];
        const mark = marks[v.id];
        const colors = COLORS[v.id] ?? COLORS.A;
        return (
          <g key={v.id} transform={v.custom ? undefined : `rotate(${ROTATION[v.from]} 200 200)`}>
            <g
              transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`}
              role={onPick ? "button" : undefined}
              tabIndex={onPick ? 0 : undefined}
              aria-label={`${v.id}: ${v.kind === "ambulance" ? "imbangukiragutabara, " : ""}${MOVE_LABEL[v.move].toLowerCase()}`}
              onClick={onPick ? () => onPick(v.id) : undefined}
              onKeyDown={onPick ? keyPick(v.id) : undefined}
              className={onPick ? "cursor-pointer outline-none [&:focus-visible>.focus]:opacity-100" : undefined}
            >
              <rect x={-27} y={-38} width={54} height={76} fill="transparent" />
              <rect className="focus" x={-23} y={-34} width={46} height={68} rx={14} fill="none" stroke="#0f172a" strokeWidth={2} strokeDasharray="4 3" opacity={0} />
              {mark && (
                <rect
                  x={-22}
                  y={-33}
                  width={44}
                  height={66}
                  rx={14}
                  fill={mark.tone === "wrong" ? "rgba(229,72,77,0.18)" : mark.tone === "right" ? "rgba(18,155,104,0.2)" : "rgba(255,255,255,0.35)"}
                  stroke={MARK_STROKE[mark.tone]}
                  strokeWidth={3}
                />
              )}
              {v.kind === "ambulance" ? <Ambulance /> : <Car body={colors.body} edge={colors.edge} />}
            </g>
          </g>
        );
      })}

      {/* Signs and lights stay upright */}
      {arms.map((arm) => {
        const at = rotate(286, lineY - 2, ROTATION[arm]);
        const sign = scenario.signs?.[arm];
        const light = scenario.lights?.[arm];
        if (!sign && !light) return null;
        return (
          <g key={arm} transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)})`}>
            {light ? <TrafficLight state={light} /> : sign && <Sign kind={sign} />}
          </g>
        );
      })}

      {/* Letters follow their vehicle */}
      {scenario.vehicles.map((v) => {
        const pose = poses[v.id];
        const r = (pose.angle * Math.PI) / 180;
        const local = { x: pose.x - 38 * Math.sin(r), y: pose.y + 38 * Math.cos(r) };
        const at = v.custom ? local : rotate(local.x, local.y, ROTATION[v.from]);
        const mark = marks[v.id];
        const ring = v.kind === "ambulance" ? "#1d6fe8" : (COLORS[v.id] ?? COLORS.A).body;
        return (
          <g key={v.id} transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)})`} pointerEvents="none">
            <circle r={12.5} fill="#ffffff" stroke={ring} strokeWidth={3} />
            <text y={4.6} textAnchor="middle" fontSize={13} fontWeight={800} fill="#0f172a" fontFamily="Arial, sans-serif">
              {v.id}
            </text>
            {mark?.label && (
              <g transform="translate(14 -13)">
                <circle r={9} fill={MARK_STROKE[mark.tone]} stroke="#ffffff" strokeWidth={2} />
                <text y={3.6} textAnchor="middle" fontSize={10} fontWeight={800} fill="#ffffff" fontFamily="Arial, sans-serif">
                  {mark.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
