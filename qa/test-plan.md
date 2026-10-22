# SambaCloud UI – Test plan

## 1. Objective

Verify that the SambaCloud UI meets the QA commitments in SOW §2.4.4: every in-scope screen works on mocked data, matches the approved Figma design at desktop widths, is usable at tablet and mobile widths, works in the supported browsers, and meets the agreed accessibility checks.

## 2. Scope

| Area | In scope |
|---|---|
| Screens | Every SOW module: authentication and app shell, Dashboard, Playground, API Keys and API Key Usage, Usage, Pricing, Project Settings, Manage Projects, Add Credits (mocked). Each in every state: empty, loading, success, error, validation, confirmation, rate-limit, zero balance. |
| Test order | Follows the build order: authentication, Dashboard, Playground and API Keys first, then the remaining modules. |
| Browsers | Chrome and Edge, latest two versions (N and N-1: 155 and 154), frozen at the start of each test cycle. |
| Desktop widths | 1280 px (primary) and 1440 px, both compared with the approved Figma frames. |
| Tablet and mobile | 768 px and 360 px: complete and usable, high-level checks for objective defects (overflow, overlap, truncation, breakpoint breaks). No Figma comparison, as no tablet or mobile frames exist. |
| Data | Mocked only (MSW), dark theme only. Page content comes from static files, in English. |
| Roles | Admin role only, as per the SOW. |

**Out of scope (SOW §3):** real APIs and client environments, a delivered automated end-to-end suite, Safari, Firefox and physical devices, a formal WCAG audit, load and security testing, light theme, the "Agentic AI" tab shown in the designs, integration with the AI gateway, Auth0, Stripe and Metronome, and CMS configurability. Any new Figma frames supplied later are treated as a change request.

## 3. Approach

Each module goes through the same cycle once development hands it to QA:

1. **Plan** – turn each SOW requirement and approved Figma screen into test cases (one file per module in [`test-cases/`](test-cases/)).
2. **Execute** – run functional, negative, edge, responsive, cross-browser, accessibility and visual checks on the build.
3. **Review** – the QA lead confirms every difference against the build and the design before it is reported.
4. **Log** – record confirmed defects in [`defects/defect-log.csv`](defects/defect-log.csv) with steps, expected and actual result, browser, width and evidence.
5. **Retest** – each new build reruns failed cases; fixed defects are closed with evidence.

Test automation and AI-assisted analysis are used to measure styles, compare screens and draft cases; every finding is confirmed by the QA lead before it counts.

## 4. Checkpoints and methods

| Checkpoint | Method | Tools | Manual pass |
|---|---|---|---|
| Unit tests for core UI components | Tests for rendering, variants, states, events and keyboard, written as components land | Vitest + React Testing Library; coverage report (target 80%, agreed with the Tech Lead) | Review of every test and the coverage report |
| Functional, negative and edge cases | Cases from each screen and state (partitions, boundaries, state changes), run on the build | Playwright; MSW data sets for empty, error, slow, rate-limit and zero-balance states | All approved cases plus one exploratory session per module |
| Responsive | Screens checked at 1440, 1280, 768 and 360 px (plus breakpoints), measuring overflow and overlap | Playwright screenshots | Browser device mode; window dragged across each breakpoint |
| Cross-browser | Chrome N as reference, repeated on Chrome N-1, Edge N and Edge N-1 and compared | Playwright; separate Edge N-1 machine | Builds that automation cannot reach |
| Accessibility | Tab order, Enter/Space/Esc, focus return, visible focus, contrast (4.5:1 text; 3:1 large text, UI and focus) | Playwright with axe-core; Colour Contrast Analyser | Keyboard-only run of every main flow |
| Visual QA against Figma | Each frame's layout and tokens compared with the built screen at 1440 and 1280 px | Figma Dev Mode; Playwright computed styles and screenshots | Each deviation confirmed in Figma Dev Mode |

Tolerances for visual checks: ±1 px for size and spacing (Minor above 1 px, Major above 4 px), colour difference ΔE ≤ 2, exact font family and weight.

## 5. Defects

- **Where:** [`defects/defect-log.csv`](defects/defect-log.csv), one row per defect (`DEF-###`).
- **Severity** (set by QA): Critical, Major, Minor, Trivial.
- **Priority** (final call by the Product Owner): High = visible in the main user flow and fixed first; Medium = visible outside the main flow; Low = small polish items.
- **Statuses:** Open → Fixed → Retest passed → Closed (or Reopened).
- Evidence for each defect is in [`evidence/`](evidence/).

## 6. Reporting and regression

- One file per test run in [`test-runs/`](test-runs/), with results by test type, screen, browser and width, visual QA results, blocked cases and linked defects.
- Regression for each build: a smoke run of the main flows on Chrome N and Edge N, the cases for changed modules and shared components, and reruns of closed Major and Critical defects. A full regression runs before sign-off.
- A final Test Summary Report is produced at sign-off.

## 7. Exit criteria

- All planned cases executed; anything Not Run has a reason the Product Owner accepted.
- No open Critical or Major defects, and written Product Owner acceptance for any open Minor defect.
- Unit tests pass and meet the agreed coverage.
- The cross-browser matrix is complete on all four builds, and every main flow passes at every width and by keyboard alone.
- Every desktop screen (1440 and 1280 px) has been compared with Figma, fixed defects are retested, and the final regression has passed.
- High-level checks at tablet and mobile widths leave no objective responsive defects open.
