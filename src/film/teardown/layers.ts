/**
 * Teardown layer manifest (Prompt D section 4). Order is the physical stack
 * front to back: front glass, display, midframe, battery, logic board,
 * silicon, thermal, coil, camera module, rear panel. Silicon at index 5
 * lands almost exactly at the sequence midpoint: the strongest beat.
 *
 * `shell` names PhoneModel layer groups; `parts` names Prompt C explode
 * registry ids. Both travel with the layer.
 */
export interface TeardownLayer {
  id: string
  /** Stack index, 0 = frontmost. Drives the separation offset. */
  index: number
  /** PhoneModel shell groups travelling with this layer. */
  shell: ReadonlyArray<'frame' | 'back' | 'glass' | 'display' | 'module'>
  /** Parts from Prompt C's layout manifest travelling with this layer. */
  parts: readonly string[]
  /** Copy key into TEARDOWN_COPY in chapters.ts. */
  copyKey: string
  /** Accent hue for this layer's rim light and text accent. */
  accent: string
  /** Hero-side scale bump when featured. */
  featureScale: number
  /**
   * Phone-local pivot the hero scale acts about (overnight fix). Shell
   * children sit near the origin, but part groups carry layout offsets —
   * scaling those groups about the origin displaces the hero by
   * (scale-1) × offset (4mm+ for the die). The driver counter-translates
   * by the flipped pivot so the featured part stays centered.
   */
  heroPivot: readonly [number, number]
  /**
   * Half-height of the featured subject in meters (round 01 A4). Drives the
   * narrow-viewport macro floor so the featured layer never crops: full
   * phone for shell layers, measured part bounds for internals (see the
   * layout manifest: cell, board union, SoC package, graphite, NFC ring,
   * camera module outerR).
   */
  featureHalfM: number
  /** Heavy layers move slowly with almost no tumble; light layers faster. */
  weight: 'light' | 'medium' | 'heavy'
}

const SCREWS = [
  'screw-0',
  'screw-1',
  'screw-2',
  'screw-3',
  'screw-4',
  'screw-5',
  'screw-6',
  'screw-7',
] as const

export const TEARDOWN_LAYERS: TeardownLayer[] = [
  {
    id: 'cover-glass',
    index: 0,
    shell: ['glass'],
    parts: [],
    copyKey: 'cover-glass',
    accent: '#9fd4ff',
    featureScale: 1.1,
    heroPivot: [0, 0] as const,
    featureHalfM: 0.08, // full phone silhouette (159.6mm)
    weight: 'light',
  },
  {
    id: 'display',
    index: 1,
    shell: ['display'],
    parts: [],
    copyKey: 'display',
    accent: '#cfe9ff',
    featureScale: 1.08,
    heroPivot: [0, 0] as const,
    featureHalfM: 0.08,
    weight: 'light',
  },
  {
    id: 'midframe',
    index: 2,
    shell: ['frame'],
    parts: [...SCREWS, 'haptic', 'speaker', 'earpiece', 'port-block'],
    copyKey: 'midframe',
    accent: '#b8c2d0',
    featureScale: 1.04,
    heroPivot: [0, 0] as const,
    featureHalfM: 0.08,
    weight: 'heavy',
  },
  {
    id: 'battery',
    index: 3,
    shell: [],
    parts: ['cell', 'cell-wrap'],
    copyKey: 'battery',
    accent: '#c4d99a',
    featureScale: 1.06,
    heroPivot: [0, -0.021] as const,
    featureHalfM: 0.039, // cell h 0.078
    weight: 'heavy',
  },
  {
    id: 'logic-board',
    index: 4,
    shell: [],
    parts: [
      'main-board',
      'sub-board',
      'btb-flex',
      'coax-l',
      'coax-r',
      'shield-lid',
      'shield-fence',
      'nand',
      'modem',
      'pmic',
      'codec',
      'rf-a',
      'rf-b',
      'rf-c',
      'charge-ic',
      'sim-cage',
    ],
    copyKey: 'logic-board',
    accent: '#7fd4b0',
    featureScale: 1.08,
    heroPivot: [0, 0.042] as const,
    featureHalfM: 0.069, // main + sub board union, y -0.0725 to 0.065
    weight: 'medium',
  },
  {
    id: 'silicon',
    index: 5,
    shell: [],
    parts: ['substrate', 'die', 'bga-array', 'decoupling-cluster'],
    copyKey: 'silicon',
    accent: '#ffc978',
    featureScale: 1.12,
    heroPivot: [-0.013, 0.0345] as const,
    featureHalfM: 0.0125, // SoC package + BGA array
    weight: 'medium',
  },
  {
    id: 'thermal',
    index: 6,
    shell: [],
    parts: ['vapor-chamber', 'graphite-sheet'],
    copyKey: 'thermal',
    accent: '#b9aecb',
    featureScale: 1.06,
    heroPivot: [0, 0.02] as const,
    featureHalfM: 0.045, // graphite sheet h 0.09, tallest in the layer
    weight: 'light',
  },
  {
    id: 'power-coil',
    index: 7,
    shell: [],
    parts: ['charge-coil', 'nfc'],
    copyKey: 'power-coil',
    accent: '#e09a5f',
    featureScale: 1.08,
    heroPivot: [0, -0.008] as const,
    featureHalfM: 0.026, // NFC ring rOut, outboard of the coil
    weight: 'medium',
  },
  {
    id: 'camera',
    index: 8,
    shell: ['module'],
    parts: [
      'camera-module',
      'lens-main',
      'lens-ultra',
      'lens-mid',
      'lens-periscope',
      'sensor-stack',
      'tof-module',
    ],
    copyKey: 'camera',
    accent: '#8fd8e0',
    featureScale: 1.1,
    heroPivot: [0, 0.0458] as const,
    featureHalfM: 0.024, // module outerR 0.0235
    weight: 'medium',
  },
  {
    id: 'rear-panel',
    index: 9,
    shell: ['back'],
    parts: [],
    copyKey: 'rear-panel',
    accent: '#c8ccd4',
    featureScale: 1.04,
    heroPivot: [0, 0] as const,
    featureHalfM: 0.08, // full phone silhouette
    weight: 'medium',
  },
]

/** Gap between adjacent layers at full separation, exaggerated like a service diagram. */
export const LAYER_GAP = 0.0085
/** Tighter gap on narrow viewports so the stack fits. */
export const LAYER_GAP_COMPACT = 0.0065

/** Layer offset = (index - (count - 1) / 2) * gap * separation. */
export function layerOffset(index: number, count: number, gap: number, separation: number): number {
  return (index - (count - 1) / 2) * gap * separation
}

/** Part id to layer index, covering the whole explode registry. */
export const PART_LAYER: Record<string, number> = {}
for (const layer of TEARDOWN_LAYERS) {
  for (const part of layer.parts) PART_LAYER[part] = layer.index
}

/**
 * Master-progress to continuous layer cursor 0..10. Integer part is the
 * current layer, fraction is local progress. Pure: reverses exactly.
 */
export function cursorAt(p: number): number {
  return Math.min(10, Math.max(0, (p - 0.295) / 0.02))
}

/**
 * Top-down peel (sandwich rewrite): every layer rides its own slot offset
 * and nothing else — no detach travel, no flip, no scale bump. The cover
 * glass (index 0) lifts first and the rear panel (index 9) lands last; all
 * ten arrive by sep = 1, so the open sandwich holds through the tour and
 * restacks in exact mirror on reverse. Pure function of sep.
 */
const PEEL_STAGGER = 0.04
const PEEL_SPAN = 0.64 // worst stagger 0.36 + span: layer 9 lands at 1.0
export function peelLocal(sep: number, index: number): number {
  const t = Math.min(1, Math.max(0, sep))
  return Math.min(1, Math.max(0, (t - index * PEEL_STAGGER) / PEEL_SPAN))
}

/** Damping rate per weight class: mass inferable from motion alone. */
export function weightDamp(weight: TeardownLayer['weight']): number {
  if (weight === 'heavy') return 2.2
  if (weight === 'medium') return 4
  return 5.5
}
