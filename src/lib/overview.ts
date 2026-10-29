import "server-only";

import { cacheLife } from "next/cache";

import type { Overview } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

/** Shown while the API cannot be reached (e.g. when the site is built without it). */
const FALLBACK: Overview = {
  questions: 399,
  lessons: 16,
  signs: 166,
  topics: 10,
  exam: {
    question_count: 20,
    duration_minutes: 20,
    pass_mark: 12,
    readiness_min_exams: 10,
    readiness_min_average: 15,
    readiness_recent_exams: 10,
  },
};

/**
 * Content counts and exam rules (GET /overview) for the public pages, so their text follows the API instead of
 * repeating its numbers. Cached for about an hour: the pages stay static, and a fallback is replaced soon after the
 * API is back. A field an older API does not send yet keeps its fallback value.
 */
export async function getOverview(): Promise<Overview> {
  "use cache";
  cacheLife("hours");
  try {
    const response = await fetch(`${API_URL}/api/v1/overview`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = (await response.json()) as Overview;
      return { ...FALLBACK, ...data, exam: { ...FALLBACK.exam, ...data.exam } };
    }
  } catch {
    // API unreachable: use the fallback below
  }
  return FALLBACK;
}
