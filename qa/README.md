# QA – SambaCloud UI

Test plan, test cases, test runs, defects and evidence for the SambaCloud UI.

## Folder structure

| Path | What it holds |
|---|---|
| [`test-plan.md`](test-plan.md) | Scope, approach, checkpoints, defect rules and exit criteria |
| [`test-cases/`](test-cases/) | One CSV per module: steps, expected result, latest status and linked defects |
| [`test-runs/`](test-runs/) | One Markdown file per test run (`YYYY-MM-DD-<scope>.md`) |
| [`defects/defect-log.csv`](defects/defect-log.csv) | Every defect, one row each (`DEF-###`) |
| [`evidence/`](evidence/) | Screenshots, one folder per run |

## Current status (22 Oct 2026)

- **Test cases:** 1,078 written, 235 executed so far (Dashboard module).
- **Latest run:** [Dashboard, 21 Oct 2026](test-runs/2026-10-21-dashboard.md) – 99 pass, 109 fail, 20 blocked, 7 not applicable.
- **Open defects:** 45 (7 High, 21 Medium, 17 Low priority) – see [`defects/defect-log.csv`](defects/defect-log.csv).
- **Next:** side navigation, Playground, API Keys, Usage, Pricing and Project Settings, as each is delivered.

## Test cases by module

| File | Covers | Cases | Executed |
|---|---|---|---|
| [`dashboard.csv`](test-cases/dashboard.csv) | Dashboard (guest, logged in, Compare Models) | 229 | 227 |
| [`navigation-and-app-shell.csv`](test-cases/navigation-and-app-shell.csv) | Side navigation, project dropdown, account menu | 92 | 0 |
| [`authentication.csv`](test-cases/authentication.csv) | Sign in, sign up | 56 | 2 |
| [`playground.csv`](test-cases/playground.csv) | Playground | 134 | 0 |
| [`api-keys.csv`](test-cases/api-keys.csv) | API Keys | 82 | 0 |
| [`api-key-usage.csv`](test-cases/api-key-usage.csv) | API Key Usage | 37 | 0 |
| [`usage.csv`](test-cases/usage.csv) | Usage | 31 | 0 |
| [`pricing.csv`](test-cases/pricing.csv) | Pricing | 23 | 0 |
| [`project-settings.csv`](test-cases/project-settings.csv) | Project Settings (general, members, billing, limits) | 202 | 0 |
| [`manage-projects.csv`](test-cases/manage-projects.csv) | Manage Projects | 36 | 0 |
| [`add-credits.csv`](test-cases/add-credits.csv) | Add Credits (mocked) | 46 | 2 |
| [`toasts-and-notifications.csv`](test-cases/toasts-and-notifications.csv) | Toasts, notifications, copy popovers | 23 | 0 |
| [`core-ui-components.csv`](test-cases/core-ui-components.csv) | Core UI components (unit tests) | 25 | 0 |
| [`end-to-end.csv`](test-cases/end-to-end.csv) | End-to-end happy paths | 17 | 0 |
| [`cross-cutting.csv`](test-cases/cross-cutting.csv) | Cross-cutting checks and out-of-scope boundaries | 45 | 4 |

## Conventions

- **Test case IDs:** `FS-<type>-###` – FN functional, NG negative, ED edge, RS responsive, XB cross-browser, AC accessibility, VQ visual QA, UT unit, E2E end-to-end, OS out-of-scope boundary.
- **Status values:** Not Run, Pass, Fail, Blocked, N/A.
- **Defect IDs:** `DEF-###`, referenced from the `defect_ids` column of the test cases.
- **Severity:** Critical, Major, Minor, Trivial. **Priority:** High (visible in the main flow), Medium, Low.
- **Evidence paths** are relative to this folder, e.g. `evidence/2026-10-21-dashboard-run/C155_1280_dashboard_fullpage.png`.

## Adding results

1. Update the `status`, `actual_result`, `defect_ids`, `executed_on` and `evidence` columns in the module's CSV.
2. Add new defects as rows in `defects/defect-log.csv` (next free `DEF-###`); update `status` when a fix is retested.
3. Add a run summary to `test-runs/` and its screenshots to a new folder under `evidence/`.
4. Keep every file under 50 MB; prefer CSV and Markdown over spreadsheets.
