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
    dev/                  Developer-only pages (404 in production): /dev/api-demo
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
  styles/                 Global CSS and design tokens
  types/                  Shared domain types
  proxy.ts                Request proxy (Next 16's replacement for middleware): auth guard
```

Import with the `@/` alias (`@/lib/api`, `@/features/projects`). Code outside a feature imports from the feature's `index.ts`, not its internal files.

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
