import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Pages that only make sense signed in, or one-off screens. /admin is left out on purpose: it answers 404 to
// everyone without an admin session, and listing it here would only advertise it.
const PRIVATE = [
  "/api/",
  "/ikaze",
  "/ibihembo",
  "/ikibaho",
  "/imyitozo",
  "/isubiramo",
  "/ikizamini/",
  "/ibizamini",
  "/umwirondoro",
  "/injira",
  "/nta-interineti",
  "/reka-kwibutswa",
  "/umwarimu",
  "/ishuri/",
  "/hangana/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    // The right-of-way scenes are public even though the rest of /imyitozo is not (the longer rule wins).
    rules: { userAgent: "*", allow: ["/", "/imyitozo/ninde-utambuka"], disallow: PRIVATE },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
