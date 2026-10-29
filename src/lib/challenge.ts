import "server-only";

import type { Challenge } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

/** GET /challenges/{code} as a stranger sees it (no session): for link previews and the challenge picture. */
export async function fetchPublicChallenge(code: string): Promise<Challenge | null> {
  if (!/^[\w-]{4,16}$/.test(code)) return null;
  try {
    const response = await fetch(`${API_URL}/api/v1/challenges/${code}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as Challenge) : null;
  } catch {
    return null;
  }
}
