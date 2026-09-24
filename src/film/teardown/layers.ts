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

function smooth01(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** Overshooting ease for light layers arriving into the feature pose. */
function easeOutBack01(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  const c1 = 1.30158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export interface FeatureFrame {
  /** 0..1 detach travel envelope (phase 1 in, phase 4 out). */
  detach: number
  /** 0..1 flip envelope (phase 2 in, phase 4 out). */
  turn: number
  /** 0..1 hero-scale envelope (hold window only). */
  scale: number
}

/**
 * Four-phase feature envelope from local progress: detach 0-0.15, flip
 * 0.25-0.70, hold 0.60-0.85, restack 0.85-1.0. Sequential by construction
 * (overnight fix): the next layer starts turning only once the previous
 * one is fully restacked, so exactly one part ever flips at a time. The
 * flip transit is slow and the hold plateau wide — scroll headroom on
 * both sides of every face-on beat. Writes into `out`: zero allocation
 * per frame. Light layers overshoot on arrival; heavy layers never do.
 * Under reduced motion there is no tumble and no overshoot: detach and
 * scale cross-fade linearly across the same phase landmarks instead of
 * stepping, so scrubbing never teleports a layer (round 01 A7).
 */
export function featureFrame(
  lp: number,
  weight: TeardownLayer['weight'],
  out: FeatureFrame,
  snap = false,
): FeatureFrame {
  if (snap) {
    const clamp01 = (t: number): number => Math.min(1, Math.max(0, t))
    const up = clamp01((lp - 0.02) / 0.13)
    const release = clamp01((0.98 - lp) / 0.13)
    out.detach = Math.min(up, release)
    out.turn = 0
    out.scale = Math.min(clamp01((lp - 0.6) / 0.08), clamp01((0.85 - lp) / 0.08))
    return out
  }
  const back = smooth01((lp - 0.85) / 0.15)
  const amp = 1 - back
  const raw = lp / 0.15
  out.detach = (weight === 'light' ? easeOutBack01(raw) : smooth01(raw)) * amp
  out.turn = smooth01((lp - 0.25) / 0.45) * amp
  out.scale = smooth01((lp - 0.6) / 0.25) * amp
  return out
}

/**
 * Local progress 0..1 for layer i within the feature run. Pure function of
 * the master progress: reverses exactly, trivially testable.
 */
export function layerProgress(
  p: number,
  index: number,
  count: number,
  runStart: number,
  runEnd: number,
): number {
  const window = (runEnd - runStart) / count
  const local = (p - (runStart + window * index)) / window
  return Math.min(1, Math.max(0, local))
}

/** Damping rate per weight class: mass inferable from motion alone. */
export function weightDamp(weight: TeardownLayer['weight']): number {
  if (weight === 'heavy') return 2.2
  if (weight === 'medium') return 4
  return 5.5
}

/** Feature gesture in hero-local meters: right and toward the viewer. */
export const FEATURE_OFFSET = { x: 0.07, y: 0.008, z: 0.014 } as const
/**
 * Turnover bringing rear-facing detail up to the overhead camera. Parts
 * are modelled facing phone-local -z (the old rear viewer); laid flat
 * that faces the table. PI minus the residual tilt turns decorated faces
 * (die marking, lens glass, wordmark) up toward the camera. NOT a tilt
 * cancel: cancelling would present their blank backs.
 */
export const FLIP = { x: Math.PI - 0.06, y: -0.085, z: -0.02 } as const
