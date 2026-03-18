# Dashboard Design Guardrails

This repository has a locked dashboard style. For any dashboard UI task, treat `asic` as the source of truth and stay inside that language instead of inventing a new one.

## Scope

These rules apply to the dashboard area that is rendered from:

- `asic/src/App.tsx`
- `asic/src/index.css`
- `src/pages/DashboardPage.tsx`

Do not let styles from the marketing site or unrelated pages redefine the dashboard look.

## Source Of Truth

- Reuse the existing shell: left sidebar, top header, restrained content width, card-based content area.
- Reuse existing primitives first: `GlowCard`, nav rows, plan cards, table rows, status badges, compact action rows.
- Reuse existing theme and accent tokens from `THEMES` and `ACCENTS` before adding new classes or colors.

## Visual Language

- Typography is restrained and functional.
- `Golos Text` is the main UI font.
- `IBM Plex Mono` is only for technical/meta values such as IDs or IPs.
- `Unbounded` is only a rare display accent, not a general heading font.
- Most UI copy should stay in the current scale: `text-xs`, `text-sm`, `text-lg`, `font-medium`, with `font-light` reserved for standout metrics.

- Surfaces are subtle, not loud.
- Prefer the existing translucent panels, soft borders, and mild accent glow.
- Keep the current radius family: `rounded-xl`, `rounded-2xl`, occasional `rounded-3xl`, and `rounded-full` for pills, avatars, and status dots.
- Keep spacing in the current rhythm: `p-3` for compact rows, `p-6` for standard cards, `p-8` only for the main hero block.

- Accent usage is controlled.
- Use only the existing accent colors defined in `ACCENTS`.
- Accent color is for active state, CTA, soft highlight, badge, or glow.
- Do not introduce extra brand colors, rainbow palettes, or new decorative gradients.

## Composition Rules

- One clear surface per section is the default.
- Avoid unnecessary wrapper layers.
- Nested surfaces are allowed only when `asic` already uses them for repeated rows, lists, or table content.
- Do not build "block inside block inside block" compositions just to add visual weight.
- New content should snap into the current shell, not create a second dashboard within the dashboard.

- Layout should stay clean and readable.
- Prefer the existing grid behavior and content density over dense KPI mosaics.
- Keep whitespace doing the work instead of extra separators, frames, or ornamental containers.

## Motion

- Motion should stay subtle and supportive.
- Match the existing fade/slide transitions and soft spring behavior.
- No loud animation, parallax, floating ornaments, pulsing widgets, or attention-seeking effects.

## Hard No

- No new visual language for dashboard tasks.
- No random redesigns because a block "could look cooler".
- No extra nested containers unless they match an existing `asic` pattern.
- No shiny marketing sections, fake depth, neumorphism, or heavy glass effects.
- No ad hoc component styling that bypasses the current theme and accent tokens.

## Workflow For Future Dashboard Edits

1. Start by finding the closest existing pattern in `asic/src/App.tsx`.
2. Reuse current tokens, spacing, radii, and states before creating anything new.
3. If a request truly does not fit the current dashboard language, stop and ask before introducing a new pattern.
