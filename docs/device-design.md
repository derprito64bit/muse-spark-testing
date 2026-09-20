# Device design, as built (M3R + Prompt A)

The Aether One X is a fictional product. The model is original industrial
design in the genre of a premium camera-forward flagship. No real
manufacturer's wordmark, island shape, or naming appears anywhere; the
wordmark is a self-designed geometric "AETHER", laser-etched, and the chip
markings are invented codes.

## Binding decision: the plateau (newest spec wins)

Prompt A section 5.2 and the M3R brief section 2.5 agree: an offset
rounded-square two-tier plateau, upper-left, with an L lens arrangement —
not a large centred circle. The dial direction is retired. Do not build a
hybrid of the two layouts.

## Body and frame

- 159.6 × 76.8 × 7.8mm, meters throughout (`phoneDimensions.ts`).
- Superellipse cross-section, exponent 5.0 (`src/lib/superellipse.ts`,
  tested). Plateau exponent 4.2 retained for procedural parts.
- Flat rail with 0.25mm micro-chamfers at the glass meeting edges;
  chamfer faces render 0.6× rail roughness (machined highlight line).
- **Grain direction (Prompt A 8.4):** the frame extrusion is split into
  four rail groups by face-centroid sector (`assignRailGroups`), carrying
  four material instances with alternating `anisotropyRotation`. Brush
  grain tiles in world units (RepeatWrapping) with per-finish repeat from
  `grainAmplitude`, rotated so grooves run along each rail.
- Antenna bands are real geometry: 1.4mm wide, outer face 0.05mm below the
  rail, colored per finish from `antennaColor`.
- Panel gaps are recessed dark hairlines, 0.12mm at frame-to-glass/ilnd.

## Camera module

- Offset rounded-square plateau (34.2mm lower, 26.2mm upper), upper-left:
  lower shelf carries the elongated dual-LED flash and the 4mm
  rangefinder; upper shelf carries three lenses in an L arrangement
  (11.4 / 11.4 / 9.2mm).
- Parametric lens factory, three instances: domed cover glass, proud
  0.35mm knurled collar (instanced teeth), gradient barrel, two baffle
  tori, front element, heptagonal aperture hint, iridescent sensor disc.
- Per-lens AR coatings: three glass instances with different base tints
  (green / magenta / neutral) and thickness ranges over a shared radial
  thickness map — stronger at the edge, as on a real coated element.
- Lower shelf: elongated dual-LED flash with diffuser dies, dark-red
  rangefinder window. Thread ring: 96 instanced teeth.

## Edges and front

- USB-C: chamfered mouth rim, dark self-shadowing cavity, centred tongue
  with a contact glint strip. Six instanced speaker slots right of port,
  single mic left at a different diameter; top rail mic plus slot,
  asymmetric throughout.
- Buttons in machined pockets (0.2mm recess, 0.1mm gap): 32mm rocker,
  14mm power key with horizontal grooves the rocker lacks.
- SIM tray flush 0.1mm below the rail with parting plate and 0.6mm
  eject pinhole.
- Front: symmetric 1.45mm bezels, 12mm earpiece slot in the top bezel
  line, 3.2mm punch-hole with 0.15mm dark ring and offset glint. Display
  corners cut tighter (0.6mm) than the cover glass (1.1mm).

## Materials and finishes

- Five finishes, five families: Obsidian (ceramic), Titanium (brushed,
  metal back), Glacier (glass, hard clearcoat), Ember (anodised, sheen, no
  clearcoat), Slate (textured matte). Recipes switch on family, not hue.
- Back glass: clearcoat over ceramic mottle with etch sparkle (subpixel
  facets that mip away below macro distance) and 2–4% albedo variation.
- Off screen: `#06080d` under a blue-violet gradient polarizer cast —
  a dark mirror for the studio panels, not black.
- Macro-only RGB subpixel overlay, faded in below 12cm camera distance,
  zero otherwise (no aliasing at normal range).
- Wordmark and regulatory micro-text ride 0.06mm off the back face as
  low-contrast decals; the wordmark tints from the back color (etched),
  never printed white.

## Lighting and color

- Procedural canvas studio environment through PMREM (softbox, strip,
  rim band, bounce pool) — no remote HDR. See `docs/rendering.md`.
- Rig: RectArea key (long softbox), RectArea strip edge-on (chamfer
  line), cool rim, fill, screen bounce tinted per finish via `envTint`.
- Film camera act adds an off-axis accent source plus a cooler
  environment tint; macro keyframes sit a third of a stop below hero.
- ACES Filmic, one curve, sRGB authored colors converted once.

## LOD policy

- **high** (desktop viewers, film): everything.
- **low** (coarse pointers): no knurling, thread ring, second baffle,
  port tongue/contacts, or regulatory text; outline sampling halved;
  no subpixel overlay. 22.2k vs 29.9k triangles (measured,
  `phoneBudget.test.ts`).
- Below-200px instances render the static CSS phone (viewer fallback),
  never WebGL.

## Deferred with reasons

- Static-shell mesh merging: ~70 draw calls at 30k triangles is not
  draw-bound on any target GPU; the x-ray act needs the layers separate.
- Sub-200px WebGL LOD2: covered by the CSS fallback instead.
- Dev superellipse tuning lives in the URL: `?bodyN=` overrides the frozen
  5.0 for a tuning session (Prompt A section 3), clamped to 2..6. No
  shipped UI carries it.
- Real-GPU frame times: open M10 thread (SwiftShader lower bounds only).
