import type { ReadinessStatus } from "@/lib/types";

export const READINESS_BADGES: Record<ReadinessStatus, { label: string; tone: "brand" | "sun" | "ocean" | "neutral" }> = {
  ready: { label: "Yiteguye", tone: "brand" },
  almost: { label: "Ari hafi", tone: "sun" },
  learning: { label: "Aracyiga", tone: "ocean" },
  new: { label: "Ntaratangira", tone: "neutral" },
};
