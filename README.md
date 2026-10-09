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

| Variable                   | Scope  | Description                                                                              |
| -------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | public | API base URL. An absolute URL, or a path such as `/api` when mocking.                    |
| `NEXT_PUBLIC_USE_MOCKS`    | public | `true` starts the MSW worker and serves all API calls from `src/mocks`. Default `false`. |
| `AUTH0_DOMAIN`             | server | Auth0 tenant domain. Placeholder, not used until auth is integrated.                     |
| `AUTH0_CLIENT_ID`          | server | Auth0 application client ID (placeholder).                                               |
| `AUTH0_CLIENT_SECRET`      | server | Auth0 application client secret (placeholder).                                           |
| `AUTH0_SECRET`             | server | 32-byte hex secret for encrypting the session cookie (placeholder).                      |
| `APP_BASE_URL`             | server | Public URL of this app, used for Auth0 callbacks (placeholder).                          |

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
  mocks/                  MSW worker, handlers, fixtures, scenario config
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
- **Primitives** (`src/components/ui`): `Button` (primary, secondary, tertiary, link, cancel, destructive, control), `IconButton`, `Badge`, `Avatar`, `Popover`, `DropdownMenu`, `Tooltip`, `Drawer`, `Skeleton`, `Icon`. Radix UI supplies behaviour only. All of them are shown in both themes at `/dev/tokens`.
- **Accessibility**: skip-to-content link, landmarks (`aside`, `nav`, `main`), visible focus rings, full keyboard operation.

**Toggling signed-in and signed-out** (with mocks on), from the browser console. The app refetches immediately, no reload needed:

```js
__mocks.set({ scenario: "guest" }); // signed out: GET /me returns 401
__mocks.reset(); // signed in again
```

The account menu’s Logout does the same through `useLogout` (a stub until Auth0).

## Data layer

- **API client** (`src/lib/api/client.ts`)
  - The Axios instance uses `NEXT_PUBLIC_API_BASE_URL` as its base URL.
  - A request interceptor attaches `Authorization: Bearer <token>` from a pluggable getter (`setAuthTokenGetter`). The getter is stubbed until Auth0 is integrated.
  - Idempotent requests (GET, HEAD, OPTIONS) are retried twice with exponential backoff, only on network errors and 5xx responses. 4xx responses and mutations are never retried. Pass `{ skipRetry: true }` to opt a request out.
  - Every failure is normalized to `ApiError { status, code, message, details }`. `status` is `0` for network errors, timeouts and cancellations.
- **TanStack Query** (`src/lib/query-client.ts`)
  - Defaults: `staleTime` 60 s, `refetchOnWindowFocus` off.
  - `retry` is off, because the Axios client already handles retries.
  - Devtools load in development only.
- **Query keys** (`src/lib/query-keys.ts`)
  - Keys are hierarchical, so a whole domain can be invalidated at once.
  - Project-scoped data lives under `queryKeys.project(id)`. `useSwitchProject()` invalidates the previous project's data on switch.
- **Reference patterns** (`src/features/examples`)
  - `useExamples`: a paginated list query using `keepPreviousData`.
  - `useCreateExample`: a mutation that invalidates the related lists.
  - See them working at `/dev/api-demo`.

## Client state (Zustand)

| Store             | Holds                                                    | Persisted                  |
| ----------------- | -------------------------------------------------------- | -------------------------- |
| `useProjectStore` | Active project id                                        | yes                        |
| `useSessionStore` | Session status (`loading`/`authenticated`/`guest`), user | no (synced from `GET /me`) |
| `useThemeStore`   | `system` / `light` / `dark`                              | yes                        |
| `useUIStore`      | Sidebar collapsed, mobile nav open, onboarding hidden    | yes, except mobile nav     |

Each store exports typed selectors (`selectX`); subscribe with `useStore(selectX)` to avoid needless re-renders. Persisted stores rehydrate after mount, which avoids server/client hydration mismatches.

## Mock API (MSW)

With `NEXT_PUBLIC_USE_MOCKS=true`, the browser service worker (`public/mockServiceWorker.js`) intercepts API calls, and the API client waits for it to start before sending any request.

| Endpoint                      | Mock                                        |
| ----------------------------- | ------------------------------------------- |
| `GET /me`                     | Current user with credit balance            |
| `GET /projects`               | Project list                                |
| `GET /projects/:id`           | Single project                              |
| `GET /projects/:id/examples`  | Paginated example list (`page`, `pageSize`) |
| `POST /projects/:id/examples` | Create an item (422 when name is empty)     |

Change the latency and error scenario from the browser console. Settings persist in localStorage:

```js
__mocks.set({ scenario: "error" }); // every request returns 500
__mocks.set({ scenario: "guest" }); // GET /me returns 401 (signed-out state)
__mocks.set({ latencyMs: 2000 }); // slow network (default 400 ms)
__mocks.reset();
```

After upgrading `msw`, regenerate the worker with `npx msw init public`.

## Routing and auth

- `/` redirects to `/dashboard`, and `/settings` redirects to `/settings/general` (`next.config.ts`).
- `src/proxy.ts` sends signed-out users from protected routes (`protectedRoutePrefixes` in `src/config/routes.ts`) to `/login?returnTo=…`. The session check is a stub that always passes until Auth0 is integrated.
