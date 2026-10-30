import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { SITE_URL } from "@/lib/site";
import type { LessonSummary } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const PUBLIC_PAGES = ["/", "/amasomo", "/ibyapa", "/ikizamini", "/imyitozo/ninde-utambuka", "/imyitozo/soma-icyapa"];

async function lessonSlugs(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/lessons`, { headers: { Accept: "application/json" }, cache: "no-store" });
    return response.ok ? ((await response.json()) as LessonSummary[]).map((lesson) => lesson.slug) : [];
  } catch {
    return []; // API unreachable: still list the main pages
  }
}

/** Public pages for search engines. Built per request, so a new lesson is listed without rebuilding the site. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const slugs = await lessonSlugs();
  return [
    ...PUBLIC_PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...slugs.map((slug) => ({ url: `${SITE_URL}/amasomo/${slug}` })),
  ];
}
