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
| `/injira` | public | Sign in / register with Google (Gmail) |
| `/ikibaho` | learner | Dashboard: exam countdown + today's plan, readiness card, averages, score trend, topic mastery |
| `/imyitozo`, `/imyitozo/kwitoza` | learner | Practice by topic with instant feedback and explanations (random, new, mistakes); offline download card |
| `/imyitozo/offline` | anyone | Practice from the copy saved on this device (works with no connection) |
| `/isubiramo` | learner | Spaced review: due questions and sign flashcards, Leitner boxes |
| `/nta-interineti` | anyone | Shown by the service worker when a page is not saved and there is no connection |
| `/reka-kwibutswa` | anyone | One-click unsubscribe from reminder emails (signed link) |
| `/ikizamini/[id]` | learner | Timed 20-question mock exam, then the graded review |
| `/ibizamini` | learner | Exam history |
| `/umwirondoro` | learner | Profile, study plan (exam date, daily goal, reminders), offline copy, sign out, delete account |
| `ADMIN_LOGIN_PATH` | private URL | Admin sign-in (email + password), never linked from the site |
| `/admin`, `/admin/abanyeshuri`, `/admin/abanyeshuri/[id]` | admin | Platform stats, learners table (search, sort, delete), learner detail |
| `/admin/ibisobanuro` | admin | Review, approve and edit question explanations; hardest questions first |

`src/proxy.ts` sends visitors without a session cookie from learner pages to `/injira`, and answers 404 for every
admin URL until an admin signs in; the API still checks every request.

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
- **Offline**: page navigations are network-first and fall back to the saved copy; a practice link opened offline
  redirects to `/imyitozo/offline`; anything not saved redirects to `/nta-interineti`. `/api`, `/admin` and RSC
  requests are never cached.
- **Sync**: answers given offline wait in `localStorage` (`gp-outbox`), tagged with the learner's id, and are sent with
  a `client_id` as soon as that learner is online again (`src/components/pwa/use-offline-sync.ts`), so a shared phone
  never mixes two learners' answers and a retry never saves twice. A bar under the header shows when the device is
  offline or answers are waiting.
- **Sign-out** deletes the saved pages and the question bank, along with the in-memory history.

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

Learners register and sign in only with Google, on `/injira`. The OAuth client ID is configured on the backend
(`GOOGLE_CLIENT_ID`, step by step in `../gira-perimi-be/README.md`) and served to the page by `GET /api/v1/auth/config`.
Add every origin the site is opened from to the client's *Authorized JavaScript origins* — for development both
`http://localhost:3000` and `http://localhost` — and open the site at `http://localhost:3000`.

The button (`src/components/auth/google-sign-in.tsx`) uses Google's popup flow, follows the site's light/dark colours,
and tells the visitor when Google's script cannot load (offline, ad blocker) instead of showing an empty box.
The site must not send `Referrer-Policy: no-referrer` or `Cross-Origin-Opener-Policy: same-origin`: both break the
Google button.

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
