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

/** Camera pad milled into the ceramic blank. */
export const ISLAND = { size: 0.0342, x: -0.0208, y: 0.05, depth: 0.002 } as const
export const ISLAND_FACE_Z = -0.0028

/** Flash LED tucked above-right of the island. */
export const FLASH = { x: -0.004, y: 0.0694, radius: 0.0026 } as const

/** Machined seat recess routed into the ceramic around the pad base. */
export const ISLAND_SEAT = { size: 0.0349, lip: 0.0002, depth: 0.0002 } as const

/** Bottom-edge hardware. */
export const PORT_COLLAR = { w: 0.0064, h: 0.0026, r: 0.0013, depth: 0.0005 } as const
export const GRILLE_SLOT = { w: 0.00055, h: 0.0003, depth: 0.0012 } as const
export const GRILLE_XS = [0.0076, 0.0091, 0.0106, 0.0121] as const

/** Half spans for edge details. */
export const SX = DIM.w / 2
export const SY = DIM.h / 2

/** Vertical silhouette height in meters for a scale and x-rotation. */
export function silhouetteHeightM(scale: number, rxRad: number): number {
  return scale * (DIM.h * Math.cos(rxRad) + DIM.t * Math.sin(rxRad))
}

/** Horizontal silhouette width in meters for a scale and y-rotation. */
export function silhouetteWidthM(scale: number, ryRad: number): number {
  return scale * (Math.abs(DIM.w * Math.cos(ryRad)) + DIM.t * Math.abs(Math.sin(ryRad)))
}
