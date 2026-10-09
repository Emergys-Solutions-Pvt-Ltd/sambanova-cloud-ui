# Design tokens: audit, decisions and open questions

Source: Figma **SambaNova Cloud Redesign** › page **Developer Screens** (`1907:193544`): 127 top-level frames plus the Components section, audited on 2026-10-09 with a read-only Plugin API script. The file has no color variables bound to layers. Only the **Mode 1** collection exists (Primary, Secondary, P 50–950, S 50–950, Heading, Stroke Dark 1/2, Button White), and it was used as the primitive backbone.

| File                                         | What                                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-inventory.json`                       | Every unique solid color, gradient and effect: usage count, fill/text/stroke split, dark/light split, sample layers, category, merge target, token |
| `../src/styles/tokens.css`                   | Primitives + semantic tokens (dark default, `[data-theme="light"]`, `prefers-color-scheme`)                                                        |
| `../src/styles/globals.css`                  | Tailwind theme wired to semantic tokens only                                                                                                       |
| `../assets/icons/`                           | Icon sources exported from Figma (→ `npm run icons`)                                                                                               |
| `../public/illustrations`, `../public/brand` | Illustrations (WebP @2x) and logo SVGs                                                                                                             |

## Audit summary

|                                               | Count   |
| --------------------------------------------- | ------- |
| Unique solid colors (incl. opacity variants)  | **239** |
| – UI colors                                   | 131     |
| – Illustration / logo artwork (not tokenised) | 70      |
| – Data viz                                    | 11      |
| – Code syntax                                 | 6       |
| – Only in the loose Components section        | 21      |
| Near-duplicates merged                        | **40**  |
| Unique gradients                              | 31      |
| Unique effects (shadows, blurs, glass)        | 45      |

Reference frames: dark **Dashboard** `1907:196249`, light **Light** `1907:204371`. Light versions also exist for some Playground "Normal Chat" frames and one Usage frame; every other screen is dark-only.

## Merged near-duplicates (please review)

ΔE is an approximate perceptual difference; below about 2 is invisible side by side.

| Kept                      | Merged in                                             | Where / why                                                                  |
| ------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `#FFFFFF`                 | `#FEFEFE`                                             | illustration white, ΔE<1                                                     |
| `#FAFAFA`                 | `#F9FAFB`, `#F8FAFC`                                  | near-white text on dark, ΔE<1                                                |
| `#F3F4F6`                 | `#F1F6FC`                                             | hero heading on dark, ΔE≈1.5                                                 |
| `#9CA3AF`                 | `#9C9C9C`, `#94A3B8`, `#8F90A6`, `#8E8F9E`, `#A5A6B5` | muted text: model-card meta (dark), Limits, chart axis; ΔE 2–6               |
| `#6B7280`                 | `#5C6984`, `#6F6F6F`, `#6F6F70`                       | muted text: model-card meta (light), components; ΔE 2–6                      |
| `#131313`                 | `#111214`, `#111115`, `#0F0F0F`, `#151515`            | dark surfaces: drawers, code card, panels; ΔE≤1                              |
| `#181818`                 | `#18181B`                                             | drawer containers                                                            |
| `#1D1D1D`                 | `#1A1A1A`, `#1E1E1E`                                  | dropdown menu / raised surfaces                                              |
| `#3C3C3C`                 | `#383838`, `#3C3E41`, `#393939`                       | segmented-control active                                                     |
| `#2B2336` (Stroke Dark 2) | `#2A2830`, `#2A2A2E`, `#2C2C2E`, `#323241`            | default dark border; the neutral greys were drawn as purple-tinted elsewhere |
| `#21192C` (Stroke Dark 1) | `#252327`                                             | subtle dark border                                                           |
| `#E5E7EB`                 | `#E4E4E4`                                             | light divider                                                                |
| `#111928`                 | `#111827`                                             | Tailwind vs Flowbite gray-900                                                |
| `#F05252`                 | `#EF4444`                                             | error                                                                        |
| `#FF5959`                 | `#FF6565`, `#FF6666`                                  | error text on dark                                                           |
| `#31C48D`                 | `#34C38F`, `#22C55E`, `#4ADE80`                       | success on dark ('Active' chip, 'Allowed' label)                             |
| `#61ABFF`                 | `#6CA2FF`                                             | info text                                                                    |
| `#F79C09` (S 500)         | `#FF9500`, `#E58F00`                                  | warning icons                                                                |
| `#C580FF`                 | `#C677FF`                                             | code syntax (dark)                                                           |
| `#8B02FF`                 | `#9400FF`                                             | code syntax (light)                                                          |

## Values I had to guess (please confirm with design)

Marked `GUESS` in `tokens.css` and on `/dev/tokens`.

| Token                                                                               | Dark                                                | Light                                                                                                                 | Why it's a guess                                                                                                               |
| ----------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| All `status-*` (success/error/warning/info × text/bg/border)                        | from Figma (borders for success/warning guessed)    | **all guessed**: Flowbite light scale (`#046C4E`/`#F3FAF7`, `#C81E1E`/`#FDF2F2`, amber S700/S50, `#1A56DB`/`#EBF5FF`) | No light screens show statuses; Figma's only light success badge (`#00C91B` on `#CAFFD4`) fails contrast at about 1.9:1        |
| `text-link-hover`                                                                   | `#DBBCF6` (P 300)                                   | `#622B86`                                                                                                             | No hover states in Figma                                                                                                       |
| `button-primary-hover`                                                              | `#E5E7EB`                                           | `#6F3099` (P 800)                                                                                                     | No hover states                                                                                                                |
| `border-focus`                                                                      | `#AD67E5` (from the file's most-used accent stroke) | `#9847D6`                                                                                                             | No focus states                                                                                                                |
| `glow-focus`                                                                        | P 500 at 35%, 3px ring                              | same                                                                                                                  | No focus states                                                                                                                |
| `border-subtle`                                                                     | Stroke Dark 1                                       | `#F4EAFD` (P 100)                                                                                                     | No light equivalent                                                                                                            |
| `chart-cached`, `chart-prompt`                                                      | `#FD9516`, `#79FFFD`                                | same                                                                                                                  | Charts only label Input/Output; the third and fourth series in "View API Key Usage" are unlabelled ("Last 30 days")            |
| `chart-grid`, `chart-axis`                                                          | from Figma                                          | black 8%, gray-500                                                                                                    | Light usage chart doesn't show a grid                                                                                          |
| `gradient-playground`                                                               | approximated                                        | **guessed**                                                                                                           | Figma uses two 700px layer-blurred polygons (purple, amber) on black; CSS radial gradients approximate it; no light Playground |
| `gradient-promo`                                                                    | radial approximation of a Figma _diamond_ gradient  | from Figma                                                                                                            | CSS has no diamond gradient                                                                                                    |
| `shadow-lg` (light)                                                                 | Figma                                               | black 8%                                                                                                              | The dark dropdown shadow (black 25%) is too heavy on white                                                                     |
| `bg-menu`, `border-menu`, `text-menu-label`                                         | Figma (`#262626`, `#4B5563`, `#6B7280`)             | white, gray-200, gray-500 (guessed)                                                                                   | No light menu in Figma                                                                                                         |
| `bg-profile`, `border-profile`                                                      | lavender 6% wash, purple 30% hairline               | same hues (guessed)                                                                                                   | Figma uses a gradient stroke and fill, approximated with single colors; no signed-in light sidebar                             |
| `text-disabled`, `border-disabled`, light button states, `button-destructive-hover` | from Figma Components (dark)                        | guessed                                                                                                               | Figma button components exist for dark only                                                                                    |
| `sidebar-width-collapsed`                                                           | 72px                                                | 72px                                                                                                                  | Tablet icon rail isn't designed                                                                                                |
| z-index layers, motion durations/easing                                             | conventional values                                 | same                                                                                                                  | Static frames only                                                                                                             |

## Inconsistencies found in Figma

1. **Four different "success" greens** for the same badge role: `#31C48D` on 8% (Billing table), `#00E91F` on `#CDFFD6`@20% (Project Settings), `#00FF09` on `#00FF08`@12% (Billing balance), and light `#00C91B` on `#CAFFD4` (Playground). All are mapped to `status-success`.
2. **Two error reds**: `#F05252` (destructive buttons, danger zone) vs `#FF5959` (badges, error drawer). Kept as border/icon vs text, but they should probably be one.
3. **Light headings use five colors**: `#1F2A37`, `#262626`, `#232220`, `#0A0A0A`, `#374151` for the same section- and card-title role. All are mapped to `text-primary` (`#1F2A37`).
4. **Light links use three purples**: `#6F3099`, `#8335BB`, `#622B86`. Mapped to `text-link` (`#6F3099`). Dark links are plain white.
5. **Model-card meta text** is neutral grey `#9C9C9C` on dark but bluish `#5C6984` on light, while the rest of the UI uses the cool `#9CA3AF`/`#6B7280` greys.
6. **Model capability meters** change hue between themes: neutral `#AAAAAA` bars on dark, blue `#506CFB` on light (empty bars are blue in both).
7. **Primary button** is white with black text on dark but purple `#622B86` with white text on light. Implemented as designed; please confirm it's intentional.
8. **Fonts**: about 650 text runs use **Inter** among about 5,700 in Lato; code samples use Lato, Consolas and Cousine. Everything uses Lato (per decision), including code.
9. **Scaled instances** leave off-grid values: radius 6.5 / 7.6 / 9.7, font sizes 10.57 / 9.28 / 8.34, strokes 0.7 / 1.27. These are snapped to the scales below.
10. **Missing states** for nearly every interactive element: hover, focus, pressed, disabled.
11. **Sidebar naming**: "Pricing" (dark) vs "Plans & Pricing" (light). The light frame also has "Monitoring & Re-training" and an "Agentic AI" item whose instance is named "AI Starter Kits". To be resolved in Work Area D (brief: Pricing, no Agentic AI).
12. **Sidebar active state** is a solid tint in both themes, not a gradient as the brief suggests: dark `#9847D6`@16% with `#EADAFA` text, light `#AD67E5`@22% with `#622B86` text.

## Typography

**Lato 2.0**, self-hosted from latofonts.com (SIL OFL 1.1) at Regular 400, Medium 500, Semibold 600 and Bold 700, because Google Fonts' Lato has no 500/600. Fallback stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.

| Token                  | Size / line height                | Weight    | Figma usage           |
| ---------------------- | --------------------------------- | --------- | --------------------- |
| `display`              | 42 / 1.2, −2%                     | 600       | Playground hero       |
| `heading-xl`           | 24 / 1.25                         | 400       | Hero banner title     |
| `heading-lg`           | 22 / 1.3                          | 600       | Page titles           |
| `heading-md`           | 20 / 1.4                          | 600       | Card and modal titles |
| `heading-sm`           | 18 / 1.4                          | 600       | Section titles        |
| `heading-xs`           | 16 / 1.5                          | 700       | Card titles           |
| `body-lg`              | 16 / 1.5                          | 400       |                       |
| `body`                 | 14 / 1.5                          | 400       | Default (1,263 runs)  |
| `body-sm`              | 13 / 1.4                          | 400       | Descriptions          |
| `label`                | 14 / 20px                         | 500       | Nav items, labels     |
| `caption`              | 12 / 1.5                          | 500       | Meta                  |
| `overline`             | 12 / 23px, uppercase              | 500       | Model-card labels     |
| `micro`                | 11 / 1.2                          | 600       | Badges                |
| `tiny`                 | 10 / 1.5                          | 400       | Sidebar email         |
| `table` / `table-head` | 14 / 1.5 · 12 / 1.5 uppercase +4% | 400 · 500 | Tables                |
| `code`                 | 14 / 1.5 (Lato)                   | 400       | Code samples          |

## Other scales

- **Spacing**: 4px grid (`--spacing: 0.25rem`). Figma's most common values (16, 10, 12, 8, 24, 6, 20, 4) all fit it.
- **Radius**: xs 4 · sm 6 · md 8 · lg 12 · xl 16 · full. Figma: 6 (1,231 uses), 12 (1,056), 8 (493), 4 (144), 16 (64), pills.
- **Borders**: 0.5 / 1 / 2px (Figma: 1px for 2,066 uses, 0.7 scaled, 0.5).
- **Elevation**: xs (tables), sm (date picker), md (modals), lg (dropdowns), plus `card-inset` (model cards) and brand/chart/focus glows.
- **Breakpoints**: Figma only has 1440px desktop frames (90 of them, plus 172–758px menus and drawers). Assumed ranges: mobile < 768, tablet 768–1023 (`md`), desktop 1024–1439 (`lg`), wide ≥ 1440 (`2xl` = the Figma width).

## Assets

- **Icons**: 58 icons from the file's icon library (Tabler/Flowbite style), exported through the Plugin API and optimised with SVGO into `src/components/ui/icon/icon-data.generated.ts` (34 KB → 11 KB of markup).
  - Colors are `currentColor`.
  - `plus` was redrawn because it's library-locked.
  - `chevron-up` was derived from `chevron-down`, because the export lost the parent rotation.
- **Illustrations** (WebP @2x, about 1.1 MB of PNG → 84 KB): hero wave (dark/light), four onboarding-step visuals (dark/light), API-keys empty state, credit-card art.
- **Brand**: the SambaNova mark (same in both themes) and the wordmark (`currentColor`: white on dark, `#333233` on light).
- **Not exported yet**: partner and model logos and the webinar image. They're dashboard content and will be exported with the Dashboard feature.
