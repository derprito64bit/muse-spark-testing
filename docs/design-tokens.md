# Design tokens — Aether One X v2

Source of truth: `src/index.css` under `@theme`. No raw hex in components.

## Surfaces

| Token     | Value     | Use             |
| --------- | --------- | --------------- |
| `night`   | `#0a0a0c` | page background |
| `surface` | `#0f1014` | cards, panels   |
| `elev`    | `#16171c` | raised          |
| `raise`   | `#1d2028` | topmost         |

Four steps, each a measurable step apart in lightness.

## Contrast (measured 2026-09-19, WCAG relative luminance)

| Foreground                | Background | Ratio   | Requirement        | Result                          |
| ------------------------- | ---------- | ------- | ------------------ | ------------------------------- |
| `ink` `#f2f2f4`           | `night`    | 17.69:1 | 7:1 primary        | pass                            |
| `dim` `#9c9da7`           | `night`    | 7.34:1  | 4.5:1 secondary    | pass                            |
| `faint` `#85868f`         | `night`    | 5.47:1  | 3:1 technical only | pass, non-essential labels only |
| `aether` `#7fb4ff`        | `night`    | 9.30:1  | 4.5:1 live data    | pass                            |
| `aether-strong` `#478dff` | `night`    | 6.14:1  | 4.5:1 focus/active | pass                            |
| `ink`                     | `surface`  | 17.01:1 | 7:1                | pass                            |
| `dim`                     | `surface`  | 7.06:1  | 4.5:1              | pass                            |

`faint` never carries essential information. Text on glass must clear 4.5:1
against the worst-case backdrop, which means an opaque scrim behind text.

## Type

- Sans: Geist Variable (UI). Mono: Geist Mono Variable (labels, units).
  Display: Space Grotesk Variable (numerals, headlines).
- Roles: `.spec-num` (display numerals, tabular lining, tight tracking),
  `.spec-unit` (mono uppercase units), `.spec-tech` (mono technical labels),
  `.kicker` (mono uppercase section label).
- No component restates letter-spacing.

## Motion

- Easings: `--ease-out-expo`, `--ease-out-quint`, `--ease-in-out-soft`.
- Durations: fast 180ms, base 320ms, slow 640ms, reveal 800ms.
- 3D damping ~5.5/s, frame-rate independent.
- `prefers-reduced-motion` is a layout, not a kill switch (see M9).

## Glass tokens

`--glass-tint`, `--glass-blur` (18px), `--glass-saturate` (140%),
`--glass-rim`, `--glass-scrim`. Variants read these, never their own numbers.
Full tier system in `docs/glass.md` (M6).
