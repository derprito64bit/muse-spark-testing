/** Aether One X body proportions in meters. Single source of truth for geometry. */
export const DIM = {
  w: 0.0768,
  h: 0.1596,
  t: 0.0078,
} as const

/** Glass panel inset from the frame edge (symmetric bezel, 1.45mm actual). */
export const BEZEL = 0.00145
/** Thin dark bezel between the glass edge and the lit display (1.6mm actual). */
export const DISPLAY_INSET = 0.0016

/** Rear ceramic panel stack. */
export const BACK_PANEL = { depth: 0.0028, z: -0.00251 } as const
export const BACK_FACE = -DIM.t / 2
/** Front glass plus the emissive display panel stacked inside it. */
export const FRONT_GLASS = { depth: 0.0015, z: 0.003 } as const
export const DISPLAY_PANEL = { depth: 0.0011, z: 0.00215 } as const

/** Front frame split: solid rear body plus a perimeter bezel ring. */
export const FRAME_BODY_DEPTH = 0.0042
export const RING_BASE_Z = 0.0004
export const RING_DEPTH = 0.0035

/** Rear ceramic outboard face: the reference plane every rear feature seats against. */
export const CERAMIC_FACE_Z = -0.00391

/**
 * Camera pad (Prompt A section 5.2, newest design authority). Offset
 * rounded-square two-tier plateau, upper-left: lower shelf carries flash
 * and rangefinder, upper shelf carries the L-arranged optics.
 */
export const ISLAND = { x: -0.0192, y: 0.052 } as const
/** Camera pad, two tiers. Lower carries flash and rangefinder, upper carries optics. */
export const ISLAND_LOWER = { size: 0.0342, depth: 0.0011 } as const
export const ISLAND_UPPER = { size: 0.0262, depth: 0.0019, dx: -0.0032, dy: 0.0028 } as const
/** Machined accessory thread ring around the pad perimeter. */
export const THREAD_RING = { inner: 0.0163, outer: 0.0171, depth: 0.0004, teeth: 96 } as const
/**
 * Lens seats, shelf-local meters. L arrangement: two stacked on the left
 * edge, one offset lower-right. Diameters 11.4, 11.4, 9.2mm with per-lens
 * AR coating hue in radians. Collar clearance against the upper shelf is
 * asserted in CameraAssembly.test.tsx.
 */
export const LENS_LAYOUT = [
  { key: 'main', dx: -0.005, dy: 0.0035, r: 0.0057, coatHue: 2.4, barrelDepth: 0.0014 },
  { key: 'ultra', dx: -0.0045, dy: -0.0038, r: 0.0057, coatHue: 5.1, barrelDepth: 0.0011 },
  { key: 'tele', dx: 0.0045, dy: -0.0035, r: 0.0046, coatHue: 0.2, barrelDepth: 0.0016 },
] as const
/** Elongated dual-LED flash on the lower shelf, clear of the upper disc. */
export const ISLAND_FLASH = { angle: 0, ring: 0.0145, w: 0.007, h: 0.003 } as const
/** Laser rangefinder window on the lower shelf, clear of the upper disc. */
export const ISLAND_RANGE = { angle: -1.2, ring: 0.0142, r: 0.002 } as const
/** Upper shelf top plane: every lens builds outward from here. */
export const ISLAND_FACE_Z = -0.00691

/** Bottom-edge hardware. */
export const GRILLE_SLOT = { w: 0.00055, h: 0.0003, depth: 0.0012 } as const
/**
 * USB-C receptacle. A true boolean hole is out of reach procedurally, so
 * the cavity reads through a chamfered mouth rim, a dark self-shadowing
 * interior set inside the edge line, and a centred tongue with contacts.
 */
export const PORT = {
  w: 0.0084,
  h: 0.0026,
  r: 0.0013,
  cavityDepth: 0.0042,
  tongue: { w: 0.0064, h: 0.0007, depth: 0.0032 },
} as const
/** Six speaker slots marching right of the port, instanced. */
export const SPEAKER_XS = [0.0082, 0.0106, 0.013, 0.0154, 0.0178, 0.0202] as const
/** Primary mic hole left of the port, different diameter from the grille. */
export const MIC_X = -0.0085
export const MIC_R = 0.00042

/** Half spans for edge details. */
export const SX = DIM.w / 2
export const SY = DIM.h / 2

/** Antenna interruption bands: 1.4mm wide, inset 0.05mm, finish-matched. */
export const ANTENNA_BAND = { w: 0.0014, inset: 0.00005, depth: 0.004 } as const
/** Buttons sit in machined pockets: 0.2mm recess, 0.1mm gap, 0.4mm proud. */
export const BUTTON_POCKET = { recess: 0.0002, gap: 0.0001, proud: 0.0004 } as const
/** Front sensors: 3.2mm punch-hole with 0.15mm dark ring, earpiece slot. */
export const PUNCH = { r: 0.0016, ring: 0.00015, y: 0.0728 } as const
export const EARPIECE = { w: 0.012, h: 0.0006, y: 0.0772 } as const

/**
 * Superellipse exponents. The exponent controls corner fullness: 2 is an
 * ellipse, 4 reads as a phone, 5.5 as a brick. Body 5.0 for tight premium
 * corners, island 4.2 slightly squarer.
 */
export const BODY_N = 5.0
export const ISLAND_N = 4.2

/**
 * Chamfer sizes in meters. Every visible edge gets one or it renders as a
 * hard colour boundary with no specular line.
 */
export const CHAMFER = {
  glassMeet: 0.00025,
  plateauStep: 0.0003,
  plateauBase: 0.0005,
  collar: 0.00015,
  button: 0.0001,
  portMouth: 0.0002,
} as const

/** Vertical silhouette height in meters for a scale and x-rotation. */
export function silhouetteHeightM(scale: number, rxRad: number): number {
  return scale * (DIM.h * Math.cos(rxRad) + DIM.t * Math.sin(rxRad))
}

/** Horizontal silhouette width in meters for a scale and y-rotation. */
export function silhouetteWidthM(scale: number, ryRad: number): number {
  return scale * (Math.abs(DIM.w * Math.cos(ryRad)) + DIM.t * Math.abs(Math.sin(ryRad)))
}
