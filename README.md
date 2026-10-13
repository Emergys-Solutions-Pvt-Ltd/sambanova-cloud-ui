# SambaNova Cloud UI

Frontend for the SambaNova Cloud developer platform: dashboard, playground, API keys, usage, pricing and project settings.

## Tech stack

| Concern       | Choice                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript (strict) |
| Styling       | Tailwind CSS 4, wired to design tokens (no UI kit)                                  |
| Server state  | TanStack Query 5 (+ Devtools in development)                                        |
| Client state  | Zustand 5                                                                           |
| HTTP          | Axios                                                                               |
| API mocking   | MSW 3 (browser service worker)                                                      |
| Forms         | React Hook Form + Zod                                                               |
| Accessibility | Radix UI headless primitives (behaviour only; all styling is ours)                  |
| Tooling       | ESLint 9, Prettier, Husky + lint-staged, EditorConfig                               |

All dependency versions are pinned exactly in `package.json`.

## Getting started

Requirements: Node.js 20.9 or later (22 LTS recommended) and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. It redirects to `/dashboard`.

`npm ci` also installs the Husky Git hooks (through the `prepare` script).

## Scripts

| Script                 | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the dev server (Turbopack) on port 3000         |
| `npm run build`        | Production build                                      |
| `npm run start`        | Serve the production build                            |
| `npm run lint`         | ESLint across the project; fails on any warning       |
| `npm run lint:fix`     | ESLint with autofix                                   |
| `npm run type-check`   | Generate Next.js route types, then run `tsc --noEmit` |
| `npm run format`       | Format everything with Prettier                       |
| `npm run format:check` | Check formatting without writing                      |

The pre-commit hook runs `lint-staged`: ESLint (`--fix`, zero warnings) and Prettier on staged files.

## Environment variables

Copy `.env.example` to `.env.local`. Public variables are validated with Zod in `src/config/env.ts`; the app fails fast with a readable message if one is missing or malformed. Always read them through `env` from `@/config/env`, never through `process.env` directly.

| Variable                     | Scope  | Description                                                                              |
| ---------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | public | API base URL. An absolute URL, or a path such as `/api` when mocking.                    |
| `NEXT_PUBLIC_QUERY_DEVTOOLS` | public | `true` shows the TanStack Query devtools button in development. Default `false`.         |
| `NEXT_PUBLIC_USE_MOCKS`      | public | `true` starts the MSW worker and serves all API calls from `src/mocks`. Default `false`. |
| `AUTH0_DOMAIN`               | server | Auth0 tenant domain. Placeholder, not used until auth is integrated.                     |
| `AUTH0_CLIENT_ID`            | server | Auth0 application client ID (placeholder).                                               |
| `AUTH0_CLIENT_SECRET`        | server | Auth0 application client secret (placeholder).                                           |
| `AUTH0_SECRET`               | server | 32-byte hex secret for encrypting the session cookie (placeholder).                      |
| `APP_BASE_URL`               | server | Public URL of this app, used for Auth0 callbacks (placeholder).                          |

`NEXT_PUBLIC_*` values are inlined at build time, so changing them requires a rebuild (or a dev-server restart).

## Folder structure

```
src/
  app/                    Routes and layouts (App Router)
    (app)/                Signed-in app: dashboard, playground, api-keys, usage,
                          pricing, projects, settings/{general,members,limits,billing}
    (auth)/               Signed-out pages: login, signup
    dev/                  Developer-only pages (404 in production): /dev/api-demo, /dev/tokens
    error.tsx             Route error boundary
    global-error.tsx      Root-layout error boundary
    not-found.tsx         404 page
    providers.tsx         Client providers (TanStack Query, store hydration, session sync)
  components/
    ui/                   Reusable primitives, built from scratch
    layout/               App shell: sidebar, header, project selector
  config/                 env.ts (validated env), routes.ts (route map, protected routes)
  features/<module>/      One folder per module: api/ (requests), hooks/ (queries and
                          mutations), components/, index.ts (public surface)
  lib/
    api/                  Axios client, ApiError, PaginatedResponse<T>
    query-client.ts       TanStack QueryClient defaults
    query-keys.ts         Query key factory
  mocks/                  MSW worker, handlers (one file per module), db, fixtures, scenario config
  stores/                 Zustand stores
  styles/                 tokens.css (design tokens), globals.css (Tailwind wiring), fonts/
  types/                  Shared domain types
assets/icons/             Icon sources exported from Figma (build input for npm run icons)
design-tokens/            Color audit and token decisions
scripts/                  check-design-tokens.mjs, build-icons.mjs
  proxy.ts                Request proxy (Next 16's replacement for middleware): auth guard
```

Import with the `@/` alias (`@/lib/api`, `@/features/projects`). Code outside a feature imports from the feature's `index.ts`, not its internal files.

## Design system

- **Tokens** live in `src/styles/tokens.css` as CSS variables. **Primitives** (`--sn-purple-500`, …) are the raw palette. **Semantic** tokens (`--sn-bg-canvas`, `--sn-text-muted`, …) say what a color is for and change per theme.
  - Dark is the default. `[data-theme="light"]` switches to light, and `prefers-color-scheme` applies when no theme is set.
- **Tailwind** is wired to semantic tokens only (`src/styles/globals.css`). The default palette and type scale are removed. Use utilities like `bg-surface`, `text-muted`, `border-default`, `text-heading-sm` and `rounded-lg`.
  - **Never write a color value in a component.** `npm run check:tokens` enforces this.
- **Theme**: `useThemeStore` holds `system | light | dark` (persisted). An inline script at the top of `<body>` applies it before first paint, so the wrong theme never flashes. `ThemeSync` keeps `<html data-theme>` in sync with the store and the OS setting.
- **Typography**: Lato 2.0, self-hosted (`src/styles/fonts/lato`, SIL OFL) at 400/500/600/700.
- **Icons**: `<Icon name="api-keys" size="md" color="muted" />`. Icons inherit `currentColor`. Add an SVG to `assets/icons/`, then run `npm run icons`.
- **Illustrations**: `public/illustrations` and `public/brand`, mapped in `src/config/assets.ts`. Use `show-in-dark` / `show-in-light` to swap themed variants.
- **Preview**: `/dev/tokens` (development only) renders every token in both themes.
- **Audit and decisions**: `design-tokens/README.md` (merges, guessed values, Figma inconsistencies) and `design-tokens/color-inventory.json`.

## App shell

`src/components/layout/app-shell.tsx` wraps every `(app)` route. Only `<main>` scrolls, so the page never scrolls sideways.

| Viewport            | Layout                                                              |
| ------------------- | ------------------------------------------------------------------- |
| < 768px (phone)     | Top bar (hamburger + logo); the sidebar opens as a slide-in drawer  |
| 768–1023px (tablet) | 72px icon rail with tooltips; its menu button opens the same drawer |
| ≥ 1024px (desktop)  | Fixed 248px sidebar                                                 |

- **Sidebar**: logo, project selector, navigation (active state follows the route, with `aria-current="page"`), account area. Items live in `src/config/navigation.ts`.
- **Project selector**: popover with search (combobox: type, ArrowUp/Down, Enter, Escape), a checkmark on the active project, Manage Projects and Create project. Switching updates `useProjectStore` and invalidates the previous project’s queries.
- **Account area**: signed in shows the profile card with credit badge and the account menu (email, Manage Projects, Theme, Documentation, Help Center, Logout). Signed out shows "Sign Up for Free" and the theme switcher. While `GET /me` loads, a placeholder holds the space.
- **Drawer**: overlay, focus trap, Escape, closes on navigation, focus returns to the opener.
- **Page frame**: use `<PageHeader title subtitle actions />` then `<PageContent>`.
- **Primitives** (`src/components/ui`): `Button` (primary, secondary, tertiary, link, cancel, destructive, control, brand, ghost, cta), `TextField`, `RadioCardGroup`, `NameDialog`, `ConfirmDialog`, `FeaturedIcon` (warning, danger), `Table`, `Pagination`, `SearchField`, `EmptyState`, `Callout`, `Toast`, `IconButton`, `Badge`, `Avatar`, `Popover`, `DropdownMenu` (menu, flat, compact surfaces), `Tooltip` (inverse, surface, rich), `Drawer` (left navigation sheet, or a right side panel: `panel` for the Playground History, `details` for the API key Request Details), `Skeleton`, `Icon`, for the Playground `Switch`, `Slider` (native range with a value bubble), `NumberInput` (spinbutton with a stepper), `Textarea` / `TextareaField` (auto-growing) and `OptionMenu` (listbox menu on a custom trigger), and for the API key usage page `DateRangePicker` with `RangeCalendar`, `BackButton`, `PaginationFooter`, `LineChart` with `ChartCard` and `ChartLegend`. Radix UI supplies behaviour only. All of them are shown in both themes at `/dev/tokens`.
- **Accessibility**: skip-to-content link, landmarks (`aside`, `nav`, `main`), visible focus rings, full keyboard operation.

**Signing in and out** (with mocks on): use the app. Sign Up for Free (sidebar) or any locked action opens the login dialog; Logout is in the account menu. See [Authentication](#authentication-mock-until-the-real-api).

## Dashboard

`/dashboard` (`src/features/dashboard`): hero banner, onboarding steps (hide/show is remembered), Usage Overview (signed-in users only), upcoming-webinar carousel, free-credits promo, Developer Quickstart (Curl / Python / Gradio snippets for the selected model, with copy), cloud partners and recommended models with a **Compare Models** dialog.

- **Data**: usage overview, model catalog, recommended models, webinars and partners come from the mock API (`src/mocks`) through TanStack Query hooks in `features/dashboard/hooks`. Each section handles its own loading and error state.
- **Snippets** are generated in `features/dashboard/lib/snippets.ts`; token kinds drive the syntax colors, so no highlighter library is needed.
- **Reusable components** added for it: `Card`, `Tabs`, `Select`, `Dialog`, `CodeBlock`, `CopyButton`, `Meter`, `ErrorState`, `ArrowLink`, `SectionHeader`, brand logos (`components/brand`), and Button variants `glass` and `outline`. All are listed in the `/dev/tokens` showcase.

## Playground

`/playground` (`src/features/playground`): chat with any catalog model, with streamed answers, speed metrics and per-project history.

- **Model picker** in the composer (models grouped Reasoning / Text / Image / text). The choice is remembered; `?model=<id>` (Dashboard "Try in Playground") selects a model.
- **Streaming**: Enter sends, Shift+Enter adds a line. While a reply streams, send becomes **Stop** (Escape also stops); a stopped reply keeps what arrived. Replies render markdown with highlighted code cards (in-house renderer and highlighter, no library). Under each reply: copy, then tokens per second, total duration and time to first token (server `usage` timings when present, else measured in the browser).
- **Edit prompt**: the pencil on a prompt edits it inline; Enter regenerates that turn, Escape cancels. A failed reply shows "Try again".
- **Header ⋮ menu**: **Tuning Parameters** (Sampling on = temperature 0.7 + top_p 0.95; Max Tokens 0 = model default, capped at the model's max output), **System Prompt** (Developer / Technical Writer / Product Manager quick-select cards or free text; the header subtitle then names the perspective) and View / Hide History.
- **Code** opens View Code: Curl / Python / Gradio snippets built from the current model, system prompt and tuning. Its model select changes only the snippet.
- **Compare Models**: two models answer the same prompt side by side, each column with its own model select and close (closing keeps the other model in single chat). Below a 672px chat area the columns become Model A / Model B tabs.
- **History** (per project): saved automatically once every reply of a turn has settled, grouped Today / Last 7 days / Last 30 days / Older, searchable by title. Each item's ⋮ offers Rename (inline, up to 80 characters) and Delete (with confirmation); both update the list optimistically. Compared chats are labelled "Compared".
- **Insufficient credits**: a 402 renders the "Insufficient Credits" card in the reply slot; **[Add Credits]** opens the Add Credits dialog. Each reply is charged to the balance, which refreshes after every stream.
- **Guests** can look around and open the dialogs; sending a prompt or opening History asks them to log in, and the prompt is sent after sign-in. The History panel shows "Sign in to see your chat history."
- **Responsive**: from 1024px History is an in-flow 290px column; below it, a right-hand drawer. Header labels collapse to icons (with tooltips) when the main column is narrower than 56rem, so the sidebar and History count.

**Client state**: `usePlaygroundPrefsStore` (model, compare pair, system prompt, tuning, History open) is persisted in localStorage under `sn:playground`, per browser like the theme. `usePlaygroundChatStore` (the open thread) and `usePlaygroundUIStore` (dialogs, drawer, draft, inline edit) are not persisted; logout, a user switch or switching away from the thread's project aborts streams and clears the thread.

**Canned answers** (`src/mocks/fixtures/playground.ts`, first match wins, case-insensitive):

| Prompt contains                           | Answer                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `remove duplicate`                        | The Figma remove-duplicates answer (JavaScript `Set`), verbatim                    |
| `react dashboard`                         | The Figma KPI dashboard answer: DeepSeek models get variant A, every other model B |
| `product launch`                          | Launch strategy (hero chip "Create a product launch strategy")                     |
| `business trip`, `itinerary` or `trip to` | 5-day itinerary (hero chip "Plan a 5-day business trip itinerary")                 |
| `compare deepseek`                        | DeepSeek vs Llama vs Gemma (hero chip "Compare DeepSeek, Llama & Gemma")           |
| `capabilit`                               | The selected model at a glance (mentions the system prompt when one is set)        |
| anything else                             | A generic structured answer naming the model                                       |

To reproduce the Figma compare screen, compare DeepSeek V3.1 with MiniMax M2.7 and ask to "Build a responsive React dashboard …".

**History seeds**: a project's first History read seeds eight chats: four today (2, 4, 6 and 8 minutes ago) and the same four titles 2, 3, 4 and 6 days ago. Titles: "Chat Bot Enhancement", "What is our cash flow projection for Q3 …", "Plan 5 day trip to Bali" and the React dashboard prompt (a DeepSeek V3.1 / MiniMax M2.7 compare). Seeded replies show the Figma metrics (202.23 t/s, 8.79s, 0.82s).

## Data layer

- **API client** (`src/lib/api/client.ts`)
  - The Axios instance uses `NEXT_PUBLIC_API_BASE_URL` as its base URL.
  - A request interceptor attaches `Authorization: Bearer <token>` from a pluggable getter (`setAuthTokenGetter`). The getter is stubbed until Auth0 is integrated.
  - Idempotent requests (GET, HEAD, OPTIONS) are retried twice with exponential backoff, only on network errors and 5xx responses. 4xx responses and mutations are never retried. Pass `{ skipRetry: true }` to opt a request out.
  - Every failure is normalized to `ApiError { status, code, message, details }`. `status` is `0` for network errors, timeouts and cancellations.
- **TanStack Query** (`src/lib/query-client.ts`)
  - Defaults: `staleTime` 60 s, `refetchOnWindowFocus` off.
  - `retry` is off, because the Axios client already handles retries.
  - Devtools are off by default; set `NEXT_PUBLIC_QUERY_DEVTOOLS=true` to show them in development.
- **Query keys** (`src/lib/query-keys.ts`)
  - Keys are hierarchical, so a whole domain can be invalidated at once.
  - Project-scoped data lives under `queryKeys.project(id)`. `useSwitchProject()` invalidates the previous project's data on switch.
- **Reference patterns** (`src/features/examples`)
  - `useExamples`: a paginated list query using `keepPreviousData`.
  - `useCreateExample`: a mutation that invalidates the related lists.
  - See them working at `/dev/api-demo`.

## Client state (Zustand)

| Store                     | Holds                                                               | Persisted                  |
| ------------------------- | ------------------------------------------------------------------- | -------------------------- |
| `useProjectStore`         | Active project id                                                   | yes                        |
| `useSessionStore`         | Session status (`loading`/`authenticated`/`guest`), user            | no (synced from `GET /me`) |
| `useThemeStore`           | `system` / `light` / `dark`                                         | yes                        |
| `useUIStore`              | Sidebar collapsed, mobile nav open, onboarding hidden               | yes, except mobile nav     |
| `usePlaygroundPrefsStore` | Playground model, compare pair, system prompt, tuning, History open | yes (`sn:playground`)      |
| `usePlaygroundChatStore`  | The open Playground thread (turns, replies, mode, models)           | no                         |
| `usePlaygroundUIStore`    | Playground dialogs, History drawer, composer draft, inline edit     | no                         |

Each store exports typed selectors (`selectX`); subscribe with `useStore(selectX)` to avoid needless re-renders. Persisted stores rehydrate after mount, which avoids server/client hydration mismatches.

## Mock API (MSW)

With `NEXT_PUBLIC_USE_MOCKS=true`, the browser service worker (`public/mockServiceWorker.js`) intercepts API calls, and the API client waits for it to start before sending any request.

| Endpoint                                             | Mock                                                                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /me`                                            | Current user with credit balance                                                                                                                           |
| `GET /projects`                                      | Project list                                                                                                                                               |
| `GET /projects/:id`                                  | Single project                                                                                                                                             |
| `GET /projects/:id/examples`                         | Paginated example list (`page`, `pageSize`)                                                                                                                |
| `POST /projects/:id/examples`                        | Create an item (422 when name is empty)                                                                                                                    |
| `GET /projects/:id/api-keys`                         | Paginated keys (`page`, `pageSize`, `search`, `status`); the Default project has 1,000 generated keys                                                      |
| `POST /projects/:id/api-keys`                        | Create a key (the secret comes back once; 409 duplicate name, 422 invalid name)                                                                            |
| `PATCH /projects/:id/api-keys/:keyId`                | Rename and/or enable or disable (409 duplicate name)                                                                                                       |
| `POST /projects/:id/api-keys/:keyId/rotate`          | New secret; the old one works for the chosen grace period                                                                                                  |
| `DELETE /projects/:id/api-keys/:keyId`               | Delete a key (204)                                                                                                                                         |
| `GET /projects/:id/api-keys/:keyId`                  | One key with its creator (404 unknown key)                                                                                                                 |
| `GET /projects/:id/api-keys/:keyId/usage`            | Requests, input and output tokens and estimated spend for `from` to `to`                                                                                   |
| `GET /projects/:id/api-keys/:keyId/usage/series`     | One point per day of the range (input, output and cached tokens) for the charts                                                                            |
| `GET /projects/:id/api-keys/:keyId/requests`         | Paginated request log for `from` to `to`, newest first                                                                                                     |
| `POST /v1/chat/completions`                          | Streamed (SSE) canned answer with a final `usage` frame; charges credits. 401 guest, 402 no credits, 404 unknown model, 422 last message not from the user |
| `GET /projects/:id/playground/conversations`         | History summaries, newest first (seeded on first read)                                                                                                     |
| `GET /projects/:id/playground/conversations/:cid`    | One saved chat (404 "Chat not found.")                                                                                                                     |
| `PUT /projects/:id/playground/conversations/:cid`    | Create or replace a chat (422 on empty title or no turns)                                                                                                  |
| `PATCH /projects/:id/playground/conversations/:cid`  | Rename (1 to 80 characters); keeps its place in the list                                                                                                   |
| `DELETE /projects/:id/playground/conversations/:cid` | Delete (204)                                                                                                                                               |

Handlers live in `src/mocks/handlers/`: `index.ts` (auth, billing, projects, dashboard data), `api-keys.ts`, `playground.ts`, and `shared.ts` with the helpers every file uses (`api`, `withSession`, `findOwnProject`, `notFound`, `validationError`). A new module adds its own file and spreads its array into `handlers`. API keys you create or edit are kept per account and project in localStorage (`sn:mock-api-keys`, `sn:mock-api-key-patches`); a key's request history is generated from its ID and the day, so it needs no storage.

Playground history is kept per account and project in localStorage (`sn:mock-playground`). Streams send one word per frame; the pause is `tokenDelayMs` scaled by the model's speed rating, and `max_tokens` cuts the answer short (`finish_reason: "length"`).

Change the latency and error scenario from the browser console. Settings persist in localStorage:

```js
__mocks.set({ scenario: "error" }); // every request returns 500
__mocks.set({ scenario: "insufficient-credits" }); // chat completions return 402
__mocks.set({ scenario: "stream-error" }); // chat streams break off part-way with an error
__mocks.set({ latencyMs: 2000 }); // slow network (default 400 ms; time to first byte for streams)
__mocks.set({ tokenDelayMs: 60 }); // slower streaming (default 18 ms between words)
__mocks.reset();
```

After upgrading `msw`, regenerate the worker with `npx msw init public`.

## Routing and auth

- `/` redirects to `/dashboard`, and `/settings` redirects to `/settings/general` (`next.config.ts`).
- `src/proxy.ts` sends signed-out users from protected routes (`protectedRoutePrefixes` in `src/config/routes.ts`) to `/login?returnTo=…`. It checks that the API's session cookie (`SESSION_COOKIE_NAME` in `src/config/auth.ts`) is present; the API itself decides whether a session is still valid.

### Projects and toasts

- **Create project:** the project menu's "Create project" opens `CreateProjectDialog` (`src/features/projects`, state in `useCreateProjectDialogStore`, mounted in the app shell; any page can open it the same way). The name is trimmed, 3 to 50 characters, and unique per account (case-insensitive) in the form and again in the API (`POST /projects` answers 409 or 422, shown under the input). On success the dialog closes, the new project becomes the active one and a success toast appears. The mock keeps created projects per account in localStorage (`sn:mock-projects`).
- **Toasts:** `toast.success("…")` (also `info`, `warning`, `danger`) from `src/stores/toast-store.ts` shows a `Toast` at the top centre, 14px from the top edge, sliding down (Figma). Default 1.5s (as in the Figma prototype; pass a duration to change it), paused while hovered or focused, with a close button. `<ToastViewport />` is mounted once in `providers.tsx`.

### API Keys

`/api-keys` (`src/features/api-keys`): a project with no keys shows the zero state (empty state, help callout); otherwise the **API Keys table**, plus the **Create API key** modal. Keys are per project: `GET /projects/:id/api-keys?page&pageSize&search&status` (paginated, filtered on the server) through `useApiKeys`, so the page follows the project selector and has loading, error and no-match states. Refresh refetches the current page with a spinning icon.

- **Table:** toolbar with a search box (key name or ID, debounced 300ms) and a Status filter (All, Active, Disabled); columns Key Name, Key ID, Created On, Last Used, Status, Actions; 10 rows per page with "Showing 1-10 of N" and numbered pagination (1 2 3 ... 100). Search text, status and page live in the URL (`?q=&status=&page=`), so reloads and the back button keep them; changing search or status returns to page 1.
- **Row actions:** the "..." menu (View Usage, Edit Key, Disable/Enable Key, Rotate Key, red Delete Key). View Usage is a link to the key's usage page; the other items report the choice to `useApiKeyActionsStore`, and `ApiKeyActionDialogs` reads it. **Edit Key** opens a `NameDialog` (title "Edit API key", `Key Name`, live `n/50`); Save stays disabled until the name is valid (not empty, 3 to 50 characters, unique in the project) and different from the current one. A rename shows "Key Name Changed Successfully" and the row gets an "Edited" chip (`renamedAt`, kept by the API). **Disable Key** opens a `ConfirmDialog`; Confirm sets the status to disabled and shows "<name> Disabled Successfully". **Enable Key** (shown for disabled keys) acts immediately with "<name> Enabled Successfully". **Rotate Key** opens "Rotate <name>" with a Grace Period dropdown (Expire old key immediately, 1 hour, 24 hours, 3 days, 7 days; starts empty, Rotate Key disabled until chosen) and an info icon whose tooltip explains the grace period; it generates a new secret (the row's masked ID changes; the old secret expires after the grace period, stored as `previousKeyExpiresAt`) and shows "<name> Rotated Successfully". **Delete Key** uses the same `ConfirmDialog` with the danger tone and a red Delete button (Figma has no Delete Key design) and shows "<name> Deleted Successfully". Endpoints: `PATCH`, `POST .../rotate` and `DELETE /projects/:id/api-keys/:keyId`.
- **Create API key:** both Create buttons open `CreateApiKeyDialog` through `useCreateApiKeyDialogStore` (guests are asked to log in first). The name is trimmed, 3 to 50 characters (live `n/50` counter, typing stops at 50) and unique within the project (the API answers 409, shown under the field). Create API Key stays disabled until the name is valid. On success the dialog closes, the table reloads and a "<name> API Key Created Successfully" toast appears. The response also carries the secret once; no screen shows it yet because Figma has none.
- **View API Key Usage:** `/api-keys/:keyId/usage` (reached from the row menu; the sidebar keeps "API Keys" highlighted). A header with a round back button (to `/api-keys`), the date range picker and an Export button (a placeholder: no export flow is designed yet); the key card (name, masked secret, Active/Disabled chip, created by, created on, last used); four stat cards (Total Requests, Input Tokens, Output Tokens, Estimated Spend); and the paginated **API Request Logs** table (Request, Time, Model, Response Time, Input/Output Tokens, Status, Action; 7 rows per page). The eye action opens the **Request Details** drawer from the right (request ID with copy, request information, token usage, the prompt and the response preview, or the error code and message for failed requests; "View full response" is shown but has no destination yet). Between the stat cards and the log sit the three token charts (below). Data: `GET /projects/:id/api-keys/:keyId`, `.../usage?from&to`, `.../usage/series?from&to` and `.../requests?from&to&page&pageSize` through `useApiKey`, `useApiKeyUsage`, `useApiKeyUsageSeries` and `useApiKeyRequests`.
- **Date range:** the picker offers Week to date, Month to date, Last 7, 14 and 30 days (default) next to a two-month calendar. Pick a shortcut, or click a start day and an end day (in either order); later days cannot be picked. The choice filters the stat cards and the log and lives in the URL (`?range=last-7-days`, or `?from=2026-06-01&to=2026-06-20`, plus `&page=2`), so reloads and the back button keep it. Arrow keys, Home/End and PageUp/PageDown move between days. Date helpers: `src/lib/date-range.ts`.
- **Charts:** **Input & Output Tokens** (full width), **Cached Tokens** and **Prompt Input Tokens** (side by side from 1280px, stacked below), drawn as SVG by the reusable `LineChart` (no chart library): smooth lines with Figma's glow, 8px dots, dashed gridlines with a solid 0 line, a nice 0 to max axis (6 gridlines) and day labels. Hovering (or tapping, or using the arrow keys, Home and End on a focused chart) shows the white tooltip with its pointer: the date and each series value (`2.98M`). The charts follow the date range: the main chart plots one point per day (up to 31 points); the two small ones group days so they have at most 11 points (Last 30 days = every 3 days), and the tooltip then shows the range of days. Prompt Input Tokens is input that was not served from cache (input minus cached), so it plus Cached Tokens equals Input Tokens. The legend of the small charts repeats the chosen range. Pieces: `ChartCard` and `ChartLegend`, `src/lib/chart.ts` (axis scale, smooth curve), `src/features/api-keys/lib/usage-series.ts` (grouping days).
- **Reusable:** `Table` pieces, `Pagination` and `PaginationFooter`, `LineChart`, `ChartCard`, `SearchField`, `NameDialog`, `EmptyState`, `Callout`, `DateRangePicker` and `RangeCalendar`, `BackButton`, `Drawer` (`side="right"`), PageHeader `leading`, Badge `shape="rounded"` and `"capsule"`, Select `variant="toolbar"`, DropdownMenuItem `destructive`, IconButton `xs`, `2xs` and the `muted` and `contrast` variants.
- **Mock:** the Default project has 1,000 generated keys (the first rows are the Figma rows); other projects start empty. Keys you create are kept per account and project in localStorage (`sn:mock-api-keys`) and listed first. The request log of a key is derived from its ID and the day (`src/mocks/db/api-key-usage.ts`): the same key always shows the same history, about four requests a day (fewer on weekends, about 6% errors), from the day it was created until now; a key that was never used has none. The stat cards and the charts add up the same requests, so they always match the table; `.../usage/series` returns one point per day of the range (up to two years).

### Credits and Add Credits

- **Credits belong to the user, not a project.** The balance is `user.creditBalance` from `GET /me` (sidebar badge and the Usage Overview "Credits Remaining" card both read it), so it is the same in every project. Usage Overview's other three numbers stay per project.
- **Add Credits dialog** (`src/features/billing`, state in `useAddCreditsDialogStore`, mounted in the app shell): opened by the hero's "Add Credits" and the Usage Overview link (guests are asked to log in first). Amount: $5 / $20 / $100 or a custom whole-dollar amount from $5 to $1,000. Billing address (saved on the account and prefilled next time) and card details (number with Luhn check, MM/YY not in the past, 3-4 digit security code) are validated in the form and again by the API. The Buy button is pinned below the scrolling form and reads "Buy $X of credits". On success the dialog closes, the balance updates and a "$X Credits Added Successfully" toast appears.
- **Mock payment:** `GET /billing/address`, `POST /billing/credits`. Any card that passes validation succeeds (e.g. 4242 4242 4242 4242); 4000 0000 0000 0002 is declined ("Your card was declined"). Card details are never stored; purchases and the address are kept per account in localStorage (`sn:mock-billing`). With the real API the card is tokenized by the payment provider in the browser and only the token goes to our API, so `purchaseCredits` in `src/features/billing/api/billing.api.ts` is the one place to change.

### Authentication (mock until the real API)

Login and sign-up are one dialog (`src/features/auth`) that opens over the dashboard: from "Sign Up for Free", from a locked action, or by visiting `/login` or `/signup` (add `?returnTo=/path` to land somewhere after login). Social buttons are placeholders.

- **Session = a cookie owned by the API.** `POST /auth/login`, `POST /auth/signup` and `POST /auth/logout` start and end it; `GET /me` reads it and answers 401 without one. The Axios client sends cookies (`withCredentials`). The client keeps no token: `useSessionStore` mirrors `GET /me` (`useSessionSync`).
- **Locked actions.** For guests, Open Playground, Create API Key, Add Credits, Compare Models and Explore in Playground stay clickable but open the login dialog (`useAuthGate`) and carry on after sign-in. The project selector is disabled and shows "Default project"; project data is not fetched.
- **Mock backend** (`src/mocks`): accounts and sessions live in localStorage (`sn:mock-accounts`, `sn:mock-sessions`), passwords are stored hashed, and the mock sets the cookie through `document.cookie`. Accounts present from the start are listed in `src/mocks/fixtures/auth.ts` (nothing in the UI reads that file; sign up to create your own). Clear those localStorage keys and the cookie to reset.
- **Swapping in the real API:** point `NEXT_PUBLIC_API_BASE_URL` at it and set `NEXT_PUBLIC_USE_MOCKS=false`. Keep the endpoint shapes in `src/features/auth/api/auth.api.ts` (or adjust that one file), make the API set the cookie named in `src/config/auth.ts`, and enable CORS credentials if it is on another origin.
