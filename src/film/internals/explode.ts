import * as THREE from 'three'

/**
 * Exploded-view part registry (Prompt B section 3). Direction is derived,
 * never authored: each part's offset from the assembly centroid,
 * normalised, blended with the z axis. radialMix 0 is pure axial (what we
 * had), 1 is a cartoon explosion; 0.45 reads as a service-manual diagram.
 */
export interface ExplodePart {
  id: string
  /** Assembly origin in meters, used to derive the radial component. */
  origin: [number, number, number]
  /** Distance this part travels at explode = 1, in meters. */
  distance: number
  /** 0..1 fraction of the explode window before this part starts moving. */
  delay: number
  /** Extra rotation at full explode, in radians, so parts turn as they lift. */
  tumble?: [number, number, number]
  /** Which layer it belongs to, for the dim and focus passes. */
  layer: 'chassis' | 'board' | 'silicon' | 'power' | 'optics' | 'thermal'
}

/** Radial-plus-axial explode direction. radialMix 0 = pure z, 1 = pure outward fan. */
export function explodeVector(
  origin: readonly [number, number, number],
  centroid: readonly [number, number, number],
  radialMix: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.set(origin[0] - centroid[0], origin[1] - centroid[1], 0)
  if (out.lengthSq() < 1e-12) out.set(0, 0, 0)
  else out.normalize()
  out.multiplyScalar(radialMix)
  // Axial sign derives from depth: the rear stack explodes rearward, so it
  // never drives through the display. Front parts go forward.
  const axial = origin[2] < centroid[2] ? -1 : 1
  out.z += axial * (1 - radialMix)
  return out.normalize()
}

/** Maps the master explode scalar through a part's delay window. */
export function partProgress(explode: number, delay: number): number {
  const t = Math.min(1, Math.max(0, (explode - delay) / (1 - delay)))
  return t * t * (3 - 2 * t)
}

/** Assembly centroid of the phone interior stack, phone-local meters. */
export const ASSEMBLY_CENTROID: [number, number, number] = [0, 0.01, -0.001]

/**
 * Registered parts. Delays derive from centroid distance (outer parts open
 * first) normalised into [0, 0.45], so the last part keeps 55 percent of
 * the window to complete its travel.
 */
function register(
  id: ExplodePart['id'],
  origin: ExplodePart['origin'],
  distance: number,
  layer: ExplodePart['layer'],
  tumble?: ExplodePart['tumble'],
): { part: ExplodePart; dist: number } {
  const dx = origin[0] - ASSEMBLY_CENTROID[0]
  const dy = origin[1] - ASSEMBLY_CENTROID[1]
  return { part: { id, origin, distance, delay: 0, layer, tumble }, dist: Math.hypot(dx, dy) }
}

const RAW = [
  register('midframe', [0.02, 0.01, 0], 0.0012, 'chassis'),
  register('rear-panel', [0, -0.03, -0.002], 0.0036, 'chassis'),
  register('front-glass', [0, 0.01, 0.003], 0.0045, 'chassis'),
  register('frame-rails', [-0.02, 0.01, 0], 0.0012, 'chassis'),
  register('pcb', [0, 0.005, -0.001], 0.0008, 'board'),
  register('shield-lid', [0.008, 0.02, -0.0005], 0.0022, 'board', [0, 0, 0.35]),
  register('shield-fence', [0.008, 0.02, -0.001], 0.0012, 'board'),
  register('decoupling-cluster', [-0.012, -0.01, -0.001], 0.0016, 'board'),
  register('connectors', [0.014, -0.02, -0.001], 0.0014, 'board'),
  register('substrate', [-0.004, 0.035, -0.001], 0.0018, 'silicon'),
  register('die', [-0.004, 0.035, -0.0005], 0.004, 'silicon', [0.12, 0, 0]),
  register('bga-array', [-0.004, 0.035, -0.0015], 0.0024, 'silicon'),
  register('thermal-plate', [-0.004, 0.035, 0], 0.0028, 'thermal'),
  register('graphite-sheet', [0, 0.01, 0.0005], 0.0032, 'thermal'),
  register('cell', [0, -0.045, -0.001], 0.003, 'power'),
  register('cell-wrap', [0, -0.045, -0.0005], 0.0038, 'power'),
  register('charge-coil', [0.01, -0.045, -0.001], 0.0044, 'power', [0, 0, -0.3]),
  register('protection-board', [-0.01, -0.055, -0.001], 0.0022, 'power'),
  register('lens-main', [-0.0274, 0.0583, -0.004], 0.0035, 'optics'),
  register('lens-ultra', [-0.0269, 0.051, -0.004], 0.0035, 'optics'),
  register('lens-tele', [-0.0179, 0.0513, -0.004], 0.0035, 'optics'),
  register('sensor-stack', [-0.0224, 0.0548, -0.005], 0.0028, 'optics'),
]

const maxDist = Math.max(...RAW.map((r) => r.dist))
for (const { part, dist } of RAW) {
  part.delay = maxDist > 0 ? (dist / maxDist) * 0.45 : 0
}

export const EXPLODE_PARTS: ExplodePart[] = RAW.map((r) => r.part)

/** Precomputed unit directions per part id, built once at module load. */
export const EXPLODE_DIRECTIONS: Record<string, THREE.Vector3> = {}
for (const part of EXPLODE_PARTS) {
  EXPLODE_DIRECTIONS[part.id] = explodeVector(
    part.origin,
    ASSEMBLY_CENTROID,
    0.45,
    new THREE.Vector3(),
  )
}
