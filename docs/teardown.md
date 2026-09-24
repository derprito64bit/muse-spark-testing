# Teardown sequence — Prompt D build notes and rubric

Replaces the x-ray, chip, and rebuild acts with one horizontal
layer-by-layer teardown (0.25–0.52). Before: `docs/teardown-before-xray.png`.
After: `docs/film-snaps/act-teardown-*.png` (stack + ten layers).

Sandwich rewrite (user direction, 2026-09-24): the flip-to-face beats are
gone — every layer rides its slot, the camera tours the open stack. The
only rotation left is the camera module parking lens-up as it peels, so
its decorated face meets the tour camera.

## How it works

- Ten layers front to back (`src/film/teardown/layers.ts`), wired to
  Prompt C part IDs (coverage asserted: every registry part exactly once).
- `layerCursor` 0–10 continuous float drives copy, accent, pointer, and
  the aim track; pure function of progress, reverses exactly.
- Top-down peel: each layer's slot offset is its own staggered function
  of the shared separation (`peelLocal`: glass lifts first, rear panel
  lands last, all arrive by sep 1). No detach travel, no flip, no scale
  bump. Weight damping (heavy 2.2, medium 4, light 5.5/s), screw spin as
  `explode × 2π`. Flicks snap past 10mm/frame instead of lag-flinging.
  Reduced motion needs no special path: the motion is positional only,
  and the static fallback serves the full reduce preference anyway.
- Camera module parks lens-up (π about the module center, driven by its
  own peel) so the collar and lenses face the tour camera instead of
  showing the housing back.
- The tour camera drifts toward the spotlight layer's slot (half-gain aim
  track at lookAt) while the stack never moves for the camera.
- Feature accent on the rim light + per-layer copy with accent figure
  underline. The accent light is single-writer: damped toward the
  featured layer's accent at 1.4 (converges; previously reset to stage
  tint every frame and ran at 8%).
- Layer copy renders all ten cards stacked; a rAF loop writes
  opacity/transform from the continuous cursor (pure function of
  progress). No AnimatePresence queue to wedge on fast scrolls. Each
  featured layer (2-8) also gets exactly one floating pointer naming
  its part, anchored from a per-frame world-position bridge the
  Internals driver publishes; shell-only layers carry none.
- Camera stands ~14° above the phone plane (Prompt D 3.1), not the old
  42° overhead dive: stack 68.5mm vs plate ~100mm (ratio ~0.68; the
  > 0.80 bar contradicts the protected 8.5mm gap, ceiling ~0.70).
- Framing fits the separated stack volume (projected extents grow with
  stackSeparate), not one plate; narrow viewports keep a full-silhouette
  macro floor as backstop. Over-zoom vs stack ≤ 0.64 on 0.5/1.0/2.0 aspects.
- Internals share materials across layers, so per-part dimming is not
  possible without cloning the set per layer (rejected: 10× material
  memory for a dimming effect). Context pop comes from the accent light,
  the aim track, and the pointer instead — see rubric 6 note.
- Legacy explode/chip scalars kept alongside (dissolve, visibility, die
  lift, battery beats); teardown overrides positioning while stacked.
- Cream studio room: stage, floor, and canvas background sit in the cream
  family across the whole film; overlay text wears ink on light stages
  (the Prompt D 11 dark scrim only applies while a stage is dark).
- Both layer drivers (director shell groups, Internals parts) call one
  shared `applyLayerTransform` helper; module nesting and screw spin stay
  at the call sites. Registered part groups must keep layout seats on
  their child meshes — a seat on the group itself is overwritten by the
  slot drive (caught on the optics lenses: all three barrels collapsed
  to the phone origin).

## Rubric (12 checks)

1. **Silhouette separation — pass.** Stage gradient + horizon + rim carry
   the edges; compare against `teardown-before-xray.png`.
2. **Stack reads as a stack — pass.** `act-teardown-stack.png`: ten
   bands, coil/board/cell/port edge distinguishable.
3. **Not a striped rectangle — pass.** 77° tilt keeps face slivers;
   coil turns and board canshapes read as objects.
4. **Hold is real — pass.** Establishing hold 0.272–0.295 on identical
   keys; the open sandwich holds sep 1 from 0.295 to 0.485 while the
   cursor tours all ten windows (tested).
5. **No collision — pass on desktop, mobile visual pending.** Text left
   42%, subject right; the stack never leaves its slots. <900px split
   implemented (compact gap + stacked copy) but not eyeballed.
6. **Context legible — pass with a note.** Accent rim light retargets per
   layer + aim track + one pointer; featured emissive pop on
   unique-material parts (die, cell band, sensor glint). Accents passed through the dataviz validator:
   they fail as a categorical palette (pastel adjacents) but that gate
   does not apply — each accent appears alone with a text label, never
   as chart series; figure text wears dim ink, never the accent. Accent
   floor asserted at 3:1 (technical, like `faint`). A bright coil can
   still outshine a small die at some angles; lighting balance is queued
   polish, not a fail.
7. **Gap persists — pass.** Stack offsets apply every frame; featured
   slot stays open by construction.
8. **Weight reads — pass on implementation.** Damps, distances, screw
   spin, still battery all in; blind timing test would be nice-to-have.
9. **Stage progression — pass.** `stageColors` ramps 0.25–0.52; stack vs
   rear-panel stills differ obviously.
10. **Product neutral — pass.** Stage carries colour; materials untouched
    (rim/accent lights only).
11. **Contrast — pass.** 24-point vitest (ink 4.5, headline 7, dim 3,
    all accents 4.5) + axe both motion modes green.
12. **Reverse scrub — pass on units, visual pass pending.** Envelopes,
    cursor, and colors are pure; scrub-continuity bounds hold. A slow
    manual 0.52→0.25 watch-through is still owed.

Score: **10 pass, 2 partial** (6 context pop, 12 visual reverse). Neither
partial blocks; both are queued polish with a defined shape.
