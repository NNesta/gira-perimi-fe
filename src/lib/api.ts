// Browser-side API client. Requests go to this origin (/api/v1 is proxied to FastAPI), so the
// httpOnly session cookie is sent automatically and never exposed to JavaScript.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK_MESSAGE = "Habaye ikibazo. Ongera ugerageze mu kanya.";

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Nta murandasi cyangwa seriveri ntiboneka. Reba interineti yawe.";
  return FALLBACK_MESSAGE;
}

type Options = Omit<RequestInit, "body"> & { json?: unknown };

export async function api<T = void>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : FALLBACK_MESSAGE;
    throw new ApiError(response.status, detail);
  }
  return data as T;
}
