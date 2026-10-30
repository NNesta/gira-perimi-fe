"use client";

import { motion } from "motion/react";
import { type ReactNode, type RefObject, useEffect, useEffectEvent, useRef } from "react";

import type { Sign } from "@/lib/types";

// The road ahead, seen from behind the car (Rwanda drives on the right, so signs stand on the right). Drawn in a
// 400 × 300 box with a simple perspective: something at depth d is drawn NEAR / d times its size, between the horizon
// and the bottom edge (depth NEAR). One animation loop moves the lane marks, the trees and the sign by writing their
// attributes directly, so React does not re-render sixty times a second.

const H = 300;
const HORIZON = 86;
const NEAR = 2;
const ROAD = 150; // half the road's width at the bottom edge
const DASH = { length: 1.6, period: 4, count: 13, half: 3.5 };
const TREE = { gap: 5, count: 12, lateral: 235 };
// The sign: on the right verge, close enough to read when it appears, at the car when time is up.
const SIGN = { lateral: 165, far: 5.5, near: 2.5, past: 0.8 };

const ASPHALT = "#3d4452";
const GRASS = "#a9d79a";

export type RoadState = "idle" | "run" | "right" | "wrong";

function project(depth: number) {
  const s = NEAR / depth;
  return { s, y: HORIZON + (H - HORIZON) * s };
}

function timerColor(remaining: number) {
  return remaining < 0.3 ? "#e5383f" : remaining < 0.6 ? "#fac81a" : "#129b68";
}

function RearCar({ braking }: { braking: boolean }) {
  return (
    <>
      <ellipse cx={200} cy={295} rx={70} ry={7} fill="rgba(15,23,42,0.35)" />
      <rect x={146} y={268} width={22} height={28} rx={5} fill="#141a24" />
      <rect x={232} y={268} width={22} height={28} rx={5} fill="#141a24" />
      <path d="M168 238 L178 206 Q180 200 187 200 L213 200 Q220 200 222 206 L232 238 Z" fill="#0b6e4a" />
      <path d="M174 236 L182 211 Q183 207 188 207 L212 207 Q217 207 218 211 L226 236 Z" fill="#bfe3f2" opacity={0.9} />
      <rect x={136} y={234} width={128} height={52} rx={14} fill="#129b68" stroke="#0b6e4a" strokeWidth={2} />
      <rect x={141} y={245} width={24} height={12} rx={4} fill={braking ? "#ff3b42" : "#b91c25"} />
      <rect x={235} y={245} width={24} height={12} rx={4} fill={braking ? "#ff3b42" : "#b91c25"} />
      {braking && (
        <g fill="#ff3b42" opacity={0.35}>
          <circle cx={153} cy={251} r={16} />
          <circle cx={247} cy={251} r={16} />
        </g>
      )}
      <rect x={176} y={259} width={48} height={16} rx={3} fill="#ffffff" stroke="#1b2433" strokeWidth={1.5} />
      <text x={200} y={271} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#1b2433" fontFamily="Arial, sans-serif">
        TSINDA
      </text>
      <rect x={140} y={279} width={120} height={9} rx={4} fill="#1b2433" />
    </>
  );
}

/**
 * The scene of "Soma icyapa!". While `state` is "run" the sign comes closer for `duration` seconds and `remaining`
 * holds the share of the time left (1 → 0); when it reaches the car, `onTimeout` is called once. "right" sends the
 * sign past the car, "wrong" stops the car with its brake lights on, "idle" just drives. A new `roundKey` starts the
 * clock again. A hidden tab pauses the clock rather than letting the time run out.
 */
export function SignRoad({
  sign,
  roundKey,
  duration,
  state,
  remaining,
  onTimeout,
  children,
}: {
  sign: Sign | null;
  roundKey: number;
  duration: number;
  state: RoadState;
  remaining?: RefObject<number>;
  onTimeout?: () => void;
  /** Score, lives and messages laid over the scene. */
  children?: ReactNode;
}) {
  const dashes = useRef<(SVGPolygonElement | null)[]>([]);
  const trees = useRef<(SVGGElement | null)[]>([]);
  const signGroup = useRef<SVGGElement>(null);
  const timer = useRef<HTMLDivElement>(null);
  const sim = useRef({ key: Number.NaN, elapsed: 0, flown: 0, travel: 0, timedOut: false });
  const timeout = useEffectEvent(() => onTimeout?.());

  useEffect(() => {
    const s = sim.current;
    if (s.key !== roundKey) Object.assign(s, { key: roundKey, elapsed: 0, flown: 0, timedOut: false });
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let frame = 0;

    function draw() {
      const phase = s.travel % DASH.period;
      dashes.current.forEach((el, k) => {
        const start = project(Math.max(0.5, NEAR * 0.7 + k * DASH.period - phase));
        const end = project(NEAR * 0.7 + k * DASH.period - phase + DASH.length);
        el?.setAttribute(
          "points",
          `${200 - DASH.half * start.s},${start.y} ${200 + DASH.half * start.s},${start.y} ` +
            `${200 + DASH.half * end.s},${end.y} ${200 - DASH.half * end.s},${end.y}`,
        );
      });
      // Trees alternate sides, so they move on by two gaps at a time to stay on their own side.
      const treePhase = s.travel % (TREE.gap * 2);
      trees.current.forEach((el, k) => {
        const depth = 1.2 + k * TREE.gap - treePhase;
        if (!el) return;
        if (depth < 1.2) return el.setAttribute("opacity", "0");
        const { s: size, y } = project(depth);
        const x = 200 + (k % 2 ? -TREE.lateral : TREE.lateral + 40) * size;
        el.setAttribute("opacity", "1");
        el.setAttribute("transform", `translate(${x} ${y}) scale(${size})`);
      });

      const left = Math.max(0, 1 - s.elapsed / duration);
      if (signGroup.current) {
        const approach = SIGN.far + (SIGN.near - SIGN.far) * (1 - left);
        const depth = approach + (SIGN.past - approach) * s.flown * s.flown;
        const { s: size, y } = project(depth);
        signGroup.current.setAttribute("transform", `translate(${200 + SIGN.lateral * size} ${y}) scale(${size})`);
        signGroup.current.setAttribute("opacity", String(Math.min(1, 2.5 - 2.5 * s.flown)));
      }
      if (timer.current) {
        timer.current.style.transform = `scaleX(${left})`;
        timer.current.style.backgroundColor = timerColor(left);
      }
      if (remaining) remaining.current = left;
      return left;
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); // a long gap means the tab was hidden: do not skip ahead
      last = now;
      if (state === "run") s.elapsed = Math.min(duration, s.elapsed + dt);
      if (state === "right") s.flown = Math.min(1, s.flown + dt / 0.5);
      if (state !== "wrong" && !still) s.travel += dt * (state === "idle" ? 3 : (36 / duration) * (state === "right" ? 1.6 : 1));
      const left = draw();
      if (state === "run" && left <= 0 && !s.timedOut) {
        s.timedOut = true;
        timeout();
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [roundKey, state, duration, remaining]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line shadow-soft">
      <svg viewBox="0 0 400 300" className="block h-auto w-full select-none" role="img" aria-label="Umuhanda n’icyapa kiri imbere">
        <defs>
          <linearGradient id="soma-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd0f2" />
            <stop offset="1" stopColor="#e3f4fb" />
          </linearGradient>
        </defs>
        <rect width={400} height={HORIZON + 1} fill="url(#soma-sky)" />
        <path
          d={`M0 ${HORIZON} Q60 ${HORIZON - 26} 120 ${HORIZON - 8} T250 ${HORIZON - 14} T400 ${HORIZON - 6} V${HORIZON + 1} H0 Z`}
          fill="#7cbf6b"
        />
        <rect y={HORIZON} width={400} height={H - HORIZON} fill={GRASS} />
        <polygon points={`199,${HORIZON} 201,${HORIZON} ${200 + ROAD + 70},${H} ${200 - ROAD - 70},${H}`} fill="#c9a46c" opacity={0.45} />
        <polygon points={`199,${HORIZON} 201,${HORIZON} ${200 + ROAD},${H} ${200 - ROAD},${H}`} fill={ASPHALT} />
        <g stroke="#ffffff" strokeWidth={3} opacity={0.85}>
          <line x1={199.5} y1={HORIZON} x2={200 - ROAD + 12} y2={H} />
          <line x1={200.5} y1={HORIZON} x2={200 + ROAD - 12} y2={H} />
        </g>
        <g fill="#ffffff" opacity={0.9}>
          {Array.from({ length: DASH.count }, (_, k) => (
            <polygon
              key={k}
              ref={(el) => {
                dashes.current[k] = el;
              }}
            />
          ))}
        </g>
        {Array.from({ length: TREE.count }, (_, k) => (
          <g
            key={k}
            opacity={0}
            ref={(el) => {
              trees.current[k] = el;
            }}
          >
            <rect x={-6} y={-40} width={12} height={40} rx={3} fill="#8a6a43" />
            <circle cy={-62} r={34} fill="#5fa452" />
            <circle cx={-10} cy={-72} r={18} fill="#7cbf6b" />
          </g>
        ))}
        {sign && (
          <g ref={signGroup} opacity={0}>
            <rect x={-6} y={-112} width={12} height={112} rx={3} fill="#9aa4b2" />
            <rect x={-80} y={-268} width={160} height={160} rx={20} fill="#ffffff" stroke="#cbd5e1" strokeWidth={3} />
            <image href={sign.image} x={-70} y={-258} width={140} height={140} preserveAspectRatio="xMidYMid meet" />
          </g>
        )}
        <motion.g
          animate={state === "wrong" ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <RearCar braking={state === "wrong"} />
        </motion.g>
      </svg>
      {state !== "idle" && (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-black/15">
          <div ref={timer} className="h-full origin-left" />
        </div>
      )}
      {children}
    </div>
  );
}
