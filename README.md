# Tsinda Neza — website

Next.js frontend for **Tsinda Neza**, a Kinyarwanda platform for learning Rwanda's road-traffic rules and practising
the provisional driving-licence theory exam. It talks to the FastAPI backend in `../gira-perimi-be`.

Stack: Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
motion (animations) · lucide-react (icons) · canvas-confetti.

## Quick start

```bash
npm install
cp .env.example .env.local      # API_URL points at the FastAPI server
npm run dev                     # http://localhost:3000
```

Start the backend first (see `../gira-perimi-be/README.md`). The site proxies `/api/v1/*` and `/media/*` to `API_URL`,
so the browser only ever talks to this origin and the httpOnly session cookies stay first-party.

```bash
npm run lint
npx tsc --noEmit
npm run build && npm start      # production
```

## Pages

| Route | Access | What it is |
|---|---|---|
| `/` | public | Landing page with a live 5-question demo |
| `/amasomo`, `/amasomo/[slug]` | public | 16 lessons; signed-in learners can mark them complete |
| `/ibyapa` | public | 166 signs and road markings: search, categories, detail view, flashcards |
| `/ikizamini` | public | Exam rules and the start button |
| `/injira` | public | Sign in / register with Google (Gmail), or ask for a sign-in link by email |
| `/injira/imeyili` | public | Where a sign-in link lands: one tap on "Injira" signs in (the link works once) |
| `/ikibaho` | learner | Dashboard: exam countdown + today's plan, readiness card, averages, score trend, topic mastery |
| `/imyitozo`, `/imyitozo/kwitoza` | learner | Practice by topic with instant feedback and explanations (random, new, mistakes); offline download card |
| `/imyitozo/offline` | anyone | Practice from the copy saved on this device (works with no connection) |
| `/imyitozo/ninde-utambuka` | anyone | "Ninde utambuka mbere?": 12 drawn intersections, tap who goes first, watch them drive off |
| `/imyitozo/shakisha` | learner | Search the whole question bank (words or booklet number), matches highlighted |
| `/admin/ubuhamya` | admin | Testimonials from learners who passed the real exam: approve or hide |
| `/ibihembo` | learner | Achievement badges: earned ones in colour, the rest with their progress |
| `/hangana/[code]` | anyone | "Hangana nanjye": a friend's challenge (their score, then the same 20 questions); its preview is `ifoto` |
| `/umwarimu`, `/umwarimu/[classId]`, `/umwarimu/[classId]/[userId]` | instructor | Driving-school classes: join codes, each learner's readiness and weak topics, learner report |
| `/ishuri/[code]` | anyone | Join a driving-school class with its code, after agreeing to share progress with its instructors |
| `/admin/amashuri` | admin | Driving schools and their instructors (by email); open or close a school |
| `/natsinze/[code]` | anyone | A result card someone shared ("Nabonye 19/20"); its link preview is the card (`ifoto`) |
| `/imyitozo/amakosa` | learner | Every question answered wrongly, by topic and status, with the learner's choice and the explanation |
| `/isubiramo` | learner | Spaced review: due questions and sign flashcards, Leitner boxes |
| `/nta-interineti` | anyone | Shown by the service worker when a page is not saved and there is no connection |
| `/reka-kwibutswa` | anyone | One-click unsubscribe from reminder emails (signed link) |
| `/ikaze` | learner | First-time welcome: exam date, daily goal, 10-question placement quiz (one per topic) |
| `/ikizamini/[id]` | learner | Timed 20-question mock exam, then the graded review |
| `/ibizamini` | learner | Exam history |
| `/umwirondoro` | learner | Profile, study plan (exam date, daily goal, reminders), offline copy, sign out, delete account |
| `ADMIN_LOGIN_PATH` | private URL | Admin sign-in (email + password), never linked from the site |
| `/admin`, `/admin/abanyeshuri`, `/admin/abanyeshuri/[id]` | admin | Platform stats, learners table (search, sort, delete), learner detail |
| `/admin/ibisobanuro` | admin | Review, approve and edit question explanations; hardest questions first |

`src/proxy.ts` sends visitors without a session cookie from learner pages to `/injira`, and answers 404 for every
admin URL until an admin signs in; the API still checks every request. New learners go from sign-in to `/ikaze`;
the dashboard links back to it until they finish or skip it.

### Search engines and link previews

- `src/app/opengraph-image.tsx` draws the picture shown when a link is shared (WhatsApp, Facebook, X). It is built
  once at build time, with the brand fonts in `src/assets/fonts` (SIL Open Font License, see the `OFL-*.txt` files).
- `src/app/sitemap.ts` (`/sitemap.xml`) lists the public pages and every lesson; `src/app/robots.ts` keeps the
  signed-in pages out of search results.
- Both, and the absolute picture URL, use `SITE_URL`: set it to the public address **before building**.
- To appear on Google sooner: add the site in [Google Search Console](https://search.google.com/search-console),
  choose the *HTML tag* method, put the code in `GOOGLE_SITE_VERIFICATION`, rebuild, verify, then submit
  `https://<your domain>/sitemap.xml` under *Sitemaps*.

## Structure

```
src/
├── app/
│   ├── (site)/        public + learner pages with header, footer and the phone tab bar
│   ├── (focus)/       distraction-free exam screen
│   ├── admin/         admin sign-in and the admin panel
│   └── globals.css    design tokens (light/dark), animations
├── components/        ui primitives, charts, quiz, exam, lessons, signs, dashboard, admin
├── lib/               api clients (browser + server), types, Kinyarwanda formatting, icons
└── proxy.ts           route protection
```

## Offline study and the installable app

The site is a Progressive Web App: `src/app/manifest.ts` (name, icons in `public/icons/`, shortcuts) and a service
worker, `public/sw.js`, registered in production only (`src/components/pwa/service-worker.tsx`).

- **Install**: "Shyira kuri telefone" uses Chrome/Android's install prompt (kept by an inline script in `<head>`), or
  shows the Share → *Add to Home Screen* steps on iPhone (`src/lib/pwa.ts`).
- **Save for offline**: "Bika kuri iki gikoresho" (practice page and profile) stores the question bank with answers
  and explanations, the lesson and practice pages, their scripts and all 311 images — about 5 MB
  (`src/lib/offline.ts`).
- **Offline**: page navigations are network-first and fall back to the saved copy (also when a stalled connection has
  not answered within 4 seconds); a practice link opened offline
  redirects to `/imyitozo/offline`; anything not saved redirects to `/nta-interineti`. `/api`, `/admin` and RSC
  requests are never cached.
- **Sync**: answers given offline wait in `localStorage` (`gp-outbox`), tagged with the learner's id, and are sent with
  a `client_id` as soon as that learner is online again (`src/components/pwa/use-offline-sync.ts`), so a shared phone
  never mixes two learners' answers and a retry never saves twice. A bar under the header shows when the device is
  offline or answers are waiting.
- **Sign-out** deletes the saved pages and the question bank, along with the in-memory history, and switches off
  phone notifications on that device.
- **Phone notifications**: "Nyibutsa kuri telefoni" (`src/components/plan/push-toggle.tsx`, `src/lib/push.ts`)
  subscribes the browser with the API's VAPID key from `GET /auth/config`; `public/sw.js` shows the reminder and
  opens the dashboard when tapped. On iPhone it asks the learner to install the app first (iOS 16.4+). Hidden when the
  API has no keys.

**"Watsinze ikizamini?"**: after the exam date the dashboard asks how it went
(`src/components/dashboard/outcome-question.tsx`); the plan card then congratulates instead of counting down. The home
page shows the reported pass rate and approved testimonials (`src/components/home/real-results.tsx`) only once the API
has enough answers.

**Error alerts**: set `SENTRY_DSN` (server: errors while rendering, via `src/instrumentation.ts`) and
`NEXT_PUBLIC_SENTRY_DSN` at build time (browser: `src/instrumentation-client.ts` and the error pages). Without them no
Sentry code is downloaded. Cookies, headers, bodies, query strings and user details are never sent
(`src/lib/sentry-privacy.ts`).

**Badges** (`src/components/badges/`): the dashboard card, the `/ibihembo` page, and a celebration with confetti the
first time this browser sees a newly earned badge (on the dashboard and after an exam).

**Sharing a result**: a passed exam shows "Sangiza abandi" (`src/components/exam/share-result.tsx`): the card image,
a WhatsApp button (`wa.me` with the text and the `/natsinze/<code>` link), the phone's share sheet with the image, or a
download. The card is drawn by `src/app/(site)/natsinze/[code]/ifoto/route.tsx` with `next/og`.

**Text size** (`src/lib/text-size.ts`): A− / A+ in the footer and the profile scales the root font size (93.75–125%),
saved per browser and applied before the first paint. Buttons may wrap at large sizes instead of overflowing.

**Lesson drawings** (`src/components/lessons/lesson-diagrams.tsx`) render `::diagram` blocks: lane markings,
overtaking, stopping distances (a worked example, labelled as such) and where not to park.

The right-of-way scenes are data (`src/lib/scenarios.ts`: vehicles, signs, lights, answer, explanation, article)
drawn by `src/components/scenarios/intersection.tsx`; every approach is drawn as the south one and rotated.

Cache names live in both `public/sw.js` and `src/lib/offline.ts`; bump them together if the cache format changes.
`/sw.js` is served with `Cache-Control: no-cache` so updates reach learners on their next visit.

## Colour theme

Visitors choose **Sisitemu** (follow the device), **Umucyo** (light) or **Umwijima** (dark) from the header, the
footer, their profile or the admin sidebar. The choice is stored in `localStorage` and applied by an inline script in
`<head>` before the first paint (`src/lib/theme.ts`), so there is no flash of the wrong theme. `<html data-theme>`
drives both the colour tokens in `globals.css` and Tailwind's `dark:` variant.

Data that depends on the visitor (cookies, URL params) is fetched in Server Components inside `<Suspense>` boundaries,
as Cache Components requires; every page prerenders a static shell and streams the rest.

## Google sign-in (learners)

Learners register and sign in with Google on `/injira`, or with a link sent by email (next section). The OAuth client ID is configured on the backend
(`GOOGLE_CLIENT_ID`, step by step in `../gira-perimi-be/README.md`) and served to the page by `GET /api/v1/auth/config`.
Add every origin the site is opened from to the client's *Authorized JavaScript origins* — for development both
`http://localhost:3000` and `http://localhost` — and open the site at `http://localhost:3000`.

The button (`src/components/auth/google-sign-in.tsx`) uses Google's popup flow, follows the site's light/dark colours,
and tells the visitor when Google's script cannot load (offline, ad blocker) instead of showing an empty box.
The site must not send `Referrer-Policy: no-referrer` or `Cross-Origin-Opener-Policy: same-origin`: both break the
Google button.

## "Umva", challenges, driving schools

- **Umva** (`src/components/quiz/listen-button.tsx`, `src/lib/audio.ts`): a button on every question and explanation
  that has a clip. One clip plays at a time; each is fetched whole and played from a `blob:` URL, so the service worker
  keeps it and it plays again offline (the CSP allows `media-src blob:` for this). The offline card can also save every
  clip at once (about 43 MB, off by default). The footer shows the voice's credit (`audio_credit` from `/overview`).
- **Hangana nanjye** (`src/components/challenge/`): every finished exam offers "Hangana n’inshuti zawe" (WhatsApp, share
  sheet, link); the link opens `/hangana/<code>`. A friend's exam on that paper shows how everyone did on its result.
- **Driving schools**: instructors (`instructor` from `/auth/me`) get "Amatsinda yanjye" in the account menu; learners
  join and leave classes from the profile ("Ishuri ryigisha gutwara") or a class link.
- **Pass rates by level**: the dashboard's readiness card says how learners at the same level did in the real exam,
  once enough of them have answered (`prediction`).
- **After the theory exam**: lessons marked `after_theory` are listed apart on `/amasomo`.

## Sign-in links by email

Under the Google button, "Injira ukoresheje imeyili" (`src/components/auth/email-sign-in.tsx`) asks for an address and,
the first time, a name; the API emails a link that works once, for 15 minutes. It is for learners who cannot use
Google: a phone set up by its seller, whose Gmail opens but whose password nobody knows, or no Gmail at all. The link
opens `/injira/imeyili`, where signing in waits for a tap (`email-link-confirm.tsx`), because mail scanners open links
by themselves. The option is shown only when the API can send email (`email_login` in `GET /auth/config`). Pages opened
with a `token` in their address are never kept by the service worker.

The profile has "Sohoka ku bikoresho byose" (sign out on every device), and lets learners without a Google account
change their name.

## Content Security Policy

`next.config.ts` sends a CSP with every page: scripts only from this site and Google's sign-in, no plugins, no
framing, no `<base>` or form hijacking, and calls and images only to known hosts (this site, Google sign-in and profile
photos, Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set). Inline scripts stay allowed: the pages are prerendered (Partial
Prerendering), and nonces would force every page to render per request (see Next's CSP guide in
`node_modules/next/dist/docs`). Adding a third-party script, font or API means adding its host there.

## Product screenshots

The phones on the home page (`src/components/home/product-screens.tsx`) show real pages, taken by
`scripts/screenshots.mjs` at phone size, in light and dark, for a demo learner on a throwaway API. The script's header
lists the three commands. Rerun it after a visible change to the dashboard, the exam or the result page; it also
reports any page error or anything the CSP blocked.

## Admin area

The admin area is internal. Nothing on the site links to it, and without an admin session every `/admin` URL shows the
ordinary 404 page. The email + password sign-in page is served only at the private path in `ADMIN_LOGIN_PATH`
(`.env.local`, server-only):

```bash
node -e "console.log('/admin/' + require('crypto').randomBytes(12).toString('base64url'))"
# ADMIN_LOGIN_PATH=/admin/<that value>   → sign in at http://localhost:3000/admin/<that value>
```

Restart the site after changing it. Admin accounts are created with the backend CLI (`python -m app.cli create-admin`).
Signing out returns to the home page.
