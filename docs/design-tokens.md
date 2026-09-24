# Design tokens — Aether One X v2

Source of truth: `src/index.css` under `@theme`. No raw hex in components.

## Surfaces

| Token     | Value     | Use             |
| --------- | --------- | --------------- |
| `night`   | `#efe9dc` | page background |
| `surface` | `#f6f1e6` | cards, panels   |
| `elev`    | `#fbf8f1` | raised          |
| `raise`   | `#fffdf9` | topmost         |

Cream studio ramp (overnight review): warm paper so part edges read at
a glance. Steps run light to lighter. The film stage keeps its dark
canvas; overlay text inside the stage keeps the deep ink ramp via the
`.film-stage-scope` override, since dark text on the dark canvas would
vanish. Fixed aurora wash stays at negligible alpha.

## Contrast (measured, WCAG relative luminance)

| Foreground                | Background    | Ratio   | Requirement        | Result                          |
| ------------------------- | ------------- | ------- | ------------------ | ------------------------------- |
| `ink` `#201a12`           | `night`       | 14.2:1  | 7:1 primary        | pass                            |
| `dim` `#5c554a`           | `night`       | 6.08:1  | 4.5:1 secondary    | pass                            |
| `faint` `#655d4f`         | `night`    | 5.36:1 | 3:1 technical only | pass, non-essential labels only |
| `aether` `#1f5fd0`        | `night`       | 4.80:1  | 4.5:1 live data    | pass                            |
| `aether-strong` `#0f4fc4` | `night`       | 5.90:1  | 4.5:1 focus/active | pass                            |
| `ink`                     | `surface`     | 15.31:1 | 7:1                | pass                            |
| `dim`                     | `surface`     | 6.53:1  | 4.5:1              | pass                            |
| `ink-inverse` `#f6f2e9`   | `aether-deep` | ~10:1   | 4.5:1 toggles      | pass                            |

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
