import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import type { Admin, User } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const SESSION_COOKIES = ["gp_session", "gp_admin"];

export class ServerApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

/** Calls the FastAPI backend from a Server Component, forwarding the visitor's session cookies. */
export async function serverFetch<T>(path: string): Promise<T> {
  const store = await cookies();
  const cookie = store
    .getAll()
    .filter((c) => SESSION_COOKIES.includes(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { Accept: "application/json", ...(cookie ? { cookie } : {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ServerApiError(response.status, typeof data?.detail === "string" ? data.detail : response.statusText);
  }
  return (await response.json()) as T;
}

/** Fetches data for a page that needs a learner session; bounces to /injira when signed out. */
export async function learnerFetch<T>(path: string, returnTo: string): Promise<T> {
  try {
    return await serverFetch<T>(path);
  } catch (error) {
    if (error instanceof ServerApiError) {
      if (error.status === 401 || error.status === 403) redirect(`/injira?next=${encodeURIComponent(returnTo)}`);
      if (error.status === 404 || error.status === 422) notFound();
    }
    throw error;
  }
}

/** Same for the admin area, which is internal: without a valid admin session it answers 404, never a sign-in link. */
export async function adminFetch<T>(path: string): Promise<T> {
  try {
    return await serverFetch<T>(path);
  } catch (error) {
    if (error instanceof ServerApiError && [401, 404, 422].includes(error.status)) notFound();
    throw error;
  }
}

/** The signed-in learner, or null. Memoised per request: the header and the page often both ask. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  if (!store.has("gp_session")) return null;
  try {
    return await serverFetch<User>("/auth/me");
  } catch {
    return null;
  }
});

export async function getSessionAdmin(): Promise<Admin | null> {
  const store = await cookies();
  if (!store.has("gp_admin")) return null;
  try {
    return await serverFetch<Admin>("/admin/auth/me");
  } catch {
    return null;
  }
}
