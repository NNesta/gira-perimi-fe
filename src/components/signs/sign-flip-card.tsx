"use client";
/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */

import { motion } from "motion/react";

import type { Sign } from "@/lib/types";

/** A flashcard: the sign on the front, its code, name and meaning on the back. */
export function SignFlipCard({ sign, flipped, onFlip }: { sign: Sign; flipped: boolean; onFlip: () => void }) {
  return (
    <div className="[perspective:1400px]">
      <motion.button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? "Subiza ikarita" : "Garagaza igisobanuro"}
        className="relative block h-[26rem] w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <span className="card absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 [backface-visibility:hidden]">
          <span className="paper flex size-56 items-center justify-center border border-line p-4 shadow-soft">
            <img src={sign.image} alt="Icyapa cyo kumenya" className="max-h-44 max-w-44 object-contain" />
          </span>
          <span className="text-sm font-semibold text-muted">Kanda ku ikarita urebe igisobanuro</span>
        </span>
        <span className="card absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold tracking-wide text-muted">{sign.code}</span>
          <span className="font-display text-2xl font-extrabold sm:text-3xl">{sign.name}</span>
          <span className="max-w-sm leading-relaxed text-muted">{sign.description}</span>
        </span>
      </motion.button>
    </div>
  );
}
