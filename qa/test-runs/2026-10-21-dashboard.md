# Test run: Dashboard module, 21 Oct 2026

| | |
|---|---|
| **Build** | Vercel preview, mocked data (MSW), dark theme |
| **Scope** | Dashboard (guest and logged in), Compare Models modal, and their toasts and modals. Other modules are still in development and stay Not Run. |
| **Browsers** | Chrome 155.0.8059.85 (N), Chrome 154.0.8037.92 (N-1), Edge 155.0.4283.62 (N). Edge 154 (N-1) blocked: not available on the test machine. |
| **Widths** | 1280 × 800 (primary desktop, DPR 1 and 1.25), 1440 px (comparison with Figma Developer Screens), 768 × 1024, 360 × 800 |
| **Tester** | Meenal Kalbande (QA lead) |
| **Evidence** | [`evidence/2026-10-21-dashboard-run/`](../evidence/2026-10-21-dashboard-run/) |

## Summary

**235 cases executed: 99 pass, 109 fail, 20 blocked, 7 not applicable.** Core features largely work; most failures are visual differences from the approved Figma design and accessibility polish (focus visibility, contrast). Chrome 155, Chrome 154 and Edge 155 rendered identically (computed-style comparison of about 250 elements).

## Results by test type

| Group | Executed | Pass | Fail | Blocked | N/A |
|---|---|---|---|---|---|
| Visual QA | 102 | 24 | 73 | 5 | 0 |
| Functional | 56 | 35 | 5 | 9 | 7 |
| Accessibility | 28 | 3 | 25 | 0 | 0 |
| Responsive | 24 | 21 | 3 | 0 | 0 |
| Cross-browser | 18 | 12 | 2 | 4 | 0 |
| Edge case | 5 | 3 | 0 | 2 | 0 |
| Negative | 2 | 1 | 1 | 0 | 0 |

## Results by screen

| Group | Executed | Pass | Fail | Blocked | N/A |
|---|---|---|---|---|---|
| Dashboard (logged in) | 180 | 74 | 84 | 15 | 7 |
| Dashboard (guest) | 22 | 10 | 11 | 1 | 0 |
| Dashboard – Compare Models | 17 | 6 | 10 | 1 | 0 |
| All in-scope screens | 4 | 3 | 0 | 1 | 0 |
| Dashboard, modals, toasts | 4 | 3 | 0 | 1 | 0 |
| Quickstart, Projects, Usage | 4 | 3 | 0 | 1 | 0 |
| Add Credits (mocked) | 2 | 0 | 2 | 0 | 0 |
| Authentication | 2 | 0 | 2 | 0 | 0 |

## Results by browser

| Group | Executed | Pass | Fail | Blocked | N/A |
|---|---|---|---|---|---|
| Chrome 155 (N) | 221 | 91 | 107 | 16 | 7 |
| Edge 155 (N) | 6 | 4 | 2 | 0 | 0 |
| Chrome 154 (N-1) | 4 | 4 | 0 | 0 | 0 |
| Edge 154 (N-1) | 4 | 0 | 0 | 4 | 0 |

## Results by width

| Group | Executed | Pass | Fail | Blocked | N/A |
|---|---|---|---|---|---|
| 1280 px (desktop) | 190 | 74 | 89 | 20 | 7 |
| 768 px (tablet) | 21 | 13 | 8 | 0 | 0 |
| 360 px (mobile) | 21 | 11 | 10 | 0 | 0 |
| All three widths | 3 | 1 | 2 | 0 | 0 |

## Visual QA against Figma

Each property (size, spacing, font, colour, radius, effect) was measured from the live build and compared with the Figma value. Tolerances: ±1 px for size and spacing, colour difference ΔE ≤ 2, exact font family and weight.

| Check set | Pass | Fail | Not run | Other |
|---|---|---|---|---|
| Property checks (1280 px) | 77 | 21 | 26 | 2 |
| Hover and motion checks | 2 | 7 | 10 | 0 |

Not-run checks belong to the side navigation, which is still in development.

## Blocked cases

| Reason | Cases |
|---|---|
| Depends on a screen still in development | 8 |
| Edge 154 not available on the test machine; needs a separate machine | 4 |
| Other (see the case in test-cases/) | 3 |
| Needs a mocked purchase with the test card | 3 |
| No mocked data for this condition yet | 2 |

## Defects linked to this run

Open defects referenced by failed cases in this run. Full details are in [`defects/defect-log.csv`](../defects/defect-log.csv).

| Defect | Summary | Severity | Priority |
|---|---|---|---|
| DEF-003 | Webinar carousel dots don't change slides | Major | High |
| DEF-016 | App shows light theme by default and has a Theme switcher – must be dark only | Major | High |
| DEF-028 | 'Sambanova.' gradient starts orange instead of Figma's peach blend | Major | High |
| DEF-029 | Visible dark rectangle behind the buttons — wave image has its own background | Major | High |
| DEF-045 | Password field shows two eye icons on Edge (app toggle + Edge built-in reveal) | Major | High |
| DEF-012 | No visible keyboard focus on Model and Endpoint dropdowns | Minor | Medium |
| DEF-013 | Usage Overview disappears with no error state when its data fails to load | Minor | Medium |
| DEF-014 | Focus not returned to the trigger after closing Compare Models / Add Credits modal | Minor | Medium |
| DEF-015 | Inactive language tabs fail text contrast (3.49:1) | Minor | Medium |
| DEF-020 | No hover state on 'Add Credits' (KPI), 'View Less' and 'Sign Up' (auth modal) | Minor | Medium |
| DEF-024 | Hover animations slower than the agreed 0.12 s (1250 / 320 / 200 ms) | Minor | Medium |
| DEF-025 | Steps do not animate — designer confirmed they must (Provisional) | Minor | Medium |
| DEF-026 | Outline broken/uneven at 1280 px | Minor | Medium |
| DEF-027 | Focus ring invisible (clipped) and focus lost after Hide Steps | Minor | Medium |
| DEF-030 | Quick-action buttons narrower than Figma (Add Credits −30 px); arrow sits next to the label | Minor | Medium |
| DEF-031 | Card hover glow faint and confined to the corner vs Figma's soft multi-colour edge glow | Minor | Medium |
| DEF-037 | Cards taller than Figma at 1280 px (steps, webinar/Earn, partners, models, Compare modal) | Minor | Medium |
| DEF-039 | Model dropdown menu has no search bar and is narrower than Figma | Minor | Medium |
| DEF-041 | Focus rings clipped by main container; code scroll area focusable with no ring | Minor | Medium |
| DEF-042 | Model description panel takes focus with no visible indicator | Minor | Medium |
| DEF-043 | Radio indicator overlaps the amount and is clipped on $100 at 360 × 800 (Samsung Galaxy A55) | Minor | Medium |
| DEF-001 | Banner subtitle line-height 18.2 px instead of 21 px | Minor | Low |
| DEF-002 | 'Usage Overview' heading is Bold 700 instead of SemiBold 600 | Minor | Low |
| DEF-004 | Content area ~15 px narrower than Figma at 1440 on Windows (scrollbar inside main) | Minor | Low |
| DEF-006 | Touch targets smaller than 44×44 on mobile | Minor | Low |
| DEF-017 | Headings ~3 px taller than Figma (Usage Overview 25.2 vs 22 px; headers 50.2 vs 47 px) | Minor | Low |
| DEF-018 | Card 16 px taller than Figma (471.9 vs 456 px) — Provisional | Minor | Low |
| DEF-019 | Compare Models button bottom-aligned and 38.6 px high vs centred 36 px | Minor | Low |
| DEF-035 | Heading text is #FFFFFF instead of Figma #F1F6FC | Minor | Low |
| DEF-036 | Quick-action buttons have no glass background blur | Minor | Low |
| DEF-038 | 'Show Steps' label Bold 12 white vs Figma SemiBold 10.57 #9847D6 | Minor | Low |
| DEF-040 | No 'Copied' popover after copying the snippet | Minor | Low |
| DEF-044 | GPT-OSS-120B logo missing the black square tile shown in Figma | Minor | Low |
