"use client";

import { CircleCheck, Timer, TrendingUp } from "lucide-react";
import { MotionConfig, motion } from "motion/react";

const ROAD =
  "M125 540C136 526.7 175.2 485 191.2 460C207.3 435 212.7 412 221.4 390C230.2 368 234.4 345.3 243.8 328C253.3 310.7 267.9 297.7 278.1 286C288.3 274.3 300.5 262.7 305 258L315 258C316.1 262.7 318 274.3 321.9 286C325.7 297.7 326.7 310.7 338.2 328C349.6 345.3 372.8 368 390.6 390C408.3 412 430.7 435 444.8 460C458.8 485 470 526.7 475 540Z";
const CENTER =
  "M300 540C303 526.7 317 485 318 460C319 435 310.5 412 306 390C301.5 368 292 345.3 291 328C290 310.7 296.8 297.7 300 286C303.2 274.3 308.3 262.7 310 258";
const EDGE_L =
  "M149.5 540C159.4 526.7 195 485 209 460C222.9 435 226.4 412 233.3 390C240.2 368 242.4 345.3 250.4 328C258.4 310.7 272 297.7 281.2 286C290.4 274.3 301.6 262.7 305.7 258";
const EDGE_R =
  "M450.5 540C446.6 526.7 439 485 427 460C415.1 435 394.6 412 378.7 390C362.8 368 341.6 345.3 331.6 328C321.6 310.7 321.7 297.7 318.8 286C315.9 274.3 315.1 262.7 314.3 258";

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff" opacity="0.92">
      <ellipse cx="0" cy="10" rx="46" ry="14" />
      <circle cx="-16" cy="2" r="16" />
      <circle cx="10" cy="-4" r="20" />
      <circle cx="32" cy="6" r="12" />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.6" y="-2" width="3.2" height="9" rx="1" fill="#6b4f2c" />
      <circle cx="0" cy="-8" r="8" style={{ fill: "var(--tree)" }} />
      <circle cx="-4" cy="-11" r="4" fill="#ffffff" opacity="0.12" />
    </g>
  );
}

function Car() {
  return (
    <g>
      <ellipse cx="0" cy="47" rx="64" ry="9" fill="#000" opacity="0.28" />
      <path d="M-42-4L-31-47Q-29-54-22-54H22Q29-54 31-47L42-4Z" fill="#129b68" />
      <path d="M-31-10L-24-44H24L31-10Z" fill="#cbeeff" opacity="0.95" />
      <path d="M-20-40H6L-8-14H-27Z" fill="#ffffff" opacity="0.45" />
      <rect x="-60" y="-8" width="120" height="44" rx="14" fill="#087d54" />
      <rect x="-56" y="2" width="20" height="10" rx="3" fill="#e5383f" />
      <rect x="36" y="2" width="20" height="10" rx="3" fill="#e5383f" />
      <rect x="-52" y="4" width="8" height="4" rx="2" fill="#ffd2d4" opacity="0.8" />
      <rect x="44" y="4" width="8" height="4" rx="2" fill="#ffd2d4" opacity="0.8" />
      <rect x="-12" y="8" width="24" height="18" rx="2.5" fill="#ffffff" />
      <path d="M-5 11V22H5.5" fill="none" stroke="#0077b8" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="-62" y="28" width="124" height="10" rx="5" fill="#1b2433" />
      <rect x="-57" y="34" width="20" height="14" rx="4" fill="#0b0f17" />
      <rect x="37" y="34" width="20" height="14" rx="4" fill="#0b0f17" />
    </g>
  );
}

function FloatingChip({
  className,
  enter,
  floatDelay,
  children,
}: {
  className: string;
  enter: string;
  floatDelay: string;
  children: React.ReactNode;
}) {
  // CSS-only motion: visible and animated even before hydration.
  return (
    <div className={`enter absolute z-10 ${enter} ${className}`}>
      <div
        className="flex animate-float items-center gap-2.5 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2.5 text-sm font-semibold text-asphalt shadow-lift backdrop-blur dark:border-white/10 dark:bg-surface/90 dark:text-ink"
        style={{ animationDelay: floatDelay }}
      >
        {children}
      </div>
    </div>
  );
}

export function HeroScene() {
  // Reduced motion is left to MotionConfig and the stylesheet's media query: branching on useReducedMotion() here
  // would render different markup on the server (null) and on such a phone (true), breaking hydration.
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative mx-auto w-full max-w-[560px]">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 shadow-lift ring-1 ring-black/5 dark:border-white/10">
          <svg viewBox="0 0 600 540" className="block h-auto w-full" role="img" aria-label="Imodoka y’umunyeshuri igenda mu muhanda unyura mu misozi">
            <defs>
              <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--sky-top)" }} />
                <stop offset="1" style={{ stopColor: "var(--sky-bottom)" }} />
              </linearGradient>
              <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#ffe680" stopOpacity="0.9" />
                <stop offset="1" stopColor="#ffe680" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="600" height="540" fill="url(#hero-sky)" />
            <circle cx="468" cy="118" r="96" fill="url(#hero-sun)" />
            <motion.circle
              cx="468"
              cy="118"
              r="42"
              fill="#fad201"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "468px 118px" }}
            />

            <motion.g
              animate={{ x: [-160, 720] }}
              transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
            >
              <Cloud x={120} y={92} />
              <Cloud x={420} y={190} scale={0.6} />
            </motion.g>
            <motion.g
              animate={{ x: [-420, 460] }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear", delay: -30 }}
            >
              <Cloud x={380} y={58} scale={0.8} />
            </motion.g>

            <path
              d="M0 300C70 250 150 250 220 272C290 294 340 240 420 238C500 236 550 270 600 262V540H0Z"
              style={{ fill: "var(--hill-far)" }}
            />
            <Tree x={70} y={268} s={0.8} />
            <Tree x={92} y={272} s={0.7} />
            <Tree x={452} y={246} s={0.8} />
            <Tree x={520} y={255} s={0.7} />
            <path
              d="M0 352C80 302 170 296 250 322C330 348 420 300 500 296C550 294 580 310 600 318V540H0Z"
              style={{ fill: "var(--hill-mid)" }}
            />
            <Tree x={40} y={340} />
            <Tree x={64} y={333} s={0.85} />
            <Tree x={540} y={312} />
            <Tree x={566} y={318} s={0.85} />

            {/* road */}
            <path d={ROAD} style={{ fill: "var(--road)" }} />
            <path d={EDGE_L} fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="3" />
            <path d={EDGE_R} fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="3" />
            <path
              d={CENTER}
              fill="none"
              stroke="#fad201"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="20 28"
              className="animate-road"
            />

            {/* warning sign A.29 */}
            <g transform="translate(176 300)">
              <rect x="-2.5" y="30" width="5" height="70" rx="2" fill="#94a3b8" />
              <path d="M0 -6L28 42H-28Z" fill="#ffffff" stroke="#e5383f" strokeWidth="6" strokeLinejoin="round" />
              <rect x="-2.6" y="8" width="5.2" height="18" rx="2" fill="#1b2433" />
              <circle cx="0" cy="32" r="3" fill="#1b2433" />
            </g>
            {/* mandatory sign */}
            <g transform="translate(236 262)">
              <rect x="-1.6" y="10" width="3.2" height="34" rx="1.5" fill="#94a3b8" />
              <circle r="12" fill="#0096dc" stroke="#ffffff" strokeWidth="2" />
              <path d="M0 6V-5M-5 0L0 -6L5 0" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
            </g>

            {/* traffic light */}
            <g transform="translate(468 330)">
              <rect x="-3" y="20" width="6" height="96" rx="3" fill="#64748b" />
              <rect x="-17" y="-62" width="34" height="86" rx="10" fill="#1b2433" />
              <circle cx="0" cy="-42" r="9" fill="#ff3b3b" className="tl-red" />
              <circle cx="0" cy="-19" r="9" fill="#ffc400" className="tl-yellow" opacity="0.16" />
              <circle cx="0" cy="4" r="9" fill="#22c55e" className="tl-green" opacity="0.16" />
            </g>

            <path d="M0 438C52 426 104 452 132 540H0Z" style={{ fill: "var(--hill-near)" }} />
            <path d="M600 424C540 428 492 462 468 540H600Z" style={{ fill: "var(--hill-near)" }} />
            <Tree x={28} y={452} s={1.3} />
            <Tree x={572} y={444} s={1.25} />

            <g transform="translate(381 468)">
              <motion.g
                animate={{ y: [0, -2.5, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              >
                <Car />
              </motion.g>
            </g>
          </svg>
        </div>

        <FloatingChip className="-left-3 top-[12%] sm:-left-8" enter="enter-5" floatDelay="0s">
          <span className="grid size-9 place-items-center rounded-xl bg-ocean-500 text-white">
            <Timer className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-medium text-muted">Ikizamini</span>
            Ikibazo 7/20 · 18:42
          </span>
        </FloatingChip>
        <FloatingChip className="-right-2 top-[42%] sm:-right-6" enter="enter-6" floatDelay="-2s">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white">
            <CircleCheck className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-medium text-muted">Igisubizo</span>
            Ni byo! +1
          </span>
        </FloatingChip>
        <FloatingChip className="-bottom-5 left-[8%]" enter="enter-7" floatDelay="-4s">
          <span className="grid size-9 place-items-center rounded-xl bg-sun-300 text-asphalt">
            <TrendingUp className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-medium text-muted">Impuzandengo</span>
            16,4 / 20 · Witeguye
          </span>
        </FloatingChip>
      </div>
    </MotionConfig>
  );
}
