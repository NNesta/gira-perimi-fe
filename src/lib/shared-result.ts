import "server-only";

/** GET /share/{code}: a result card someone chose to share (public). */
export type SharedResult = { name: string; score: number; total: number; passed: boolean; day: string };

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

export async function fetchSharedResult(code: string): Promise<SharedResult | null> {
  if (!/^[\w-]{4,16}$/.test(code)) return null;
  try {
    const response = await fetch(`${API_URL}/api/v1/share/${code}`, { headers: { Accept: "application/json" }, cache: "no-store" });
    return response.ok ? ((await response.json()) as SharedResult) : null;
  } catch {
    return null;
  }
}
