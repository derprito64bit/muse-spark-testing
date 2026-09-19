import * as THREE from 'three'
import {
  BEZEL,
  CERAMIC_FACE_Z,
  DIM,
  FRAME_BODY_DEPTH,
  ISLAND,
  ISLAND_FACE_Z,
  ISLAND_SEAT,
  RING_BASE_Z,
  RING_DEPTH,
} from './phoneDimensions.ts'

/** Traces a centered rounded-square outline with corner radius r. */
export function squirclePath(
  path: THREE.Shape | THREE.Path,
  x: number,
  y: number,
  size: number,
  sizeY: number,
  r: number,
): void {
  const c = Math.min(r, size / 2, sizeY / 2)
  path.moveTo(x + c, y)
  path.lineTo(x + size - c, y)
  path.quadraticCurveTo(x + size, y, x + size, y + c)
  path.lineTo(x + size, y + sizeY - c)
  path.quadraticCurveTo(x + size, y + sizeY, x + size - c, y + sizeY)
  path.lineTo(x + c, y + sizeY)
  path.quadraticCurveTo(x, y + sizeY, x, y + sizeY - c)
  path.lineTo(x, y + c)
  path.quadraticCurveTo(x, y, x + c, y)
}

/** Traces a rounded-rectangle outline with corner radius r. */
export function roundedRectPath(
  path: THREE.Shape | THREE.Path,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const c = Math.min(r, w / 2, h / 2)
  path.moveTo(x + c, y)
  path.lineTo(x + w - c, y)
  path.quadraticCurveTo(x + w, y, x + w, y + c)
  path.lineTo(x + w, y + h - c)
  path.quadraticCurveTo(x + w, y + h, x + w - c, y + h)
  path.lineTo(x + c, y + h)
  path.quadraticCurveTo(x, y + h, x, y + h - c)
  path.lineTo(x, y + c)
  path.quadraticCurveTo(x, y, x + c, y)
}

/** Rounded-square extruded plate for the camera pad. Outboard face lands on the seat plane. */
export function createSquircleGeometry(
  size: number,
  sizeY: number,
  depth: number,
  bevelSize = 0.00012,
  bevelThickness = 0.00012,
): THREE.BufferGeometry {
  const r = Math.min(0.005, size / 2, sizeY / 2)
  const shape = new THREE.Shape()
  squirclePath(shape, -size / 2, -size / 2, size, sizeY, r)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize,
    bevelThickness,
    bevelSegments: 4,
    curveSegments: 24,
    steps: 1,
  })
  geometry.translate(0, 0, -(depth / 2 + bevelThickness))
  return geometry
}

/** Outline ring for the machined seat, routed below the ceramic face to avoid z-fighting. */
export function createSeatRingGeometry(
  size: number,
  lip: number,
  depth: number,
): THREE.BufferGeometry {
  const r = Math.min(0.005, size / 2)
  const half = size / 2
  const shape = new THREE.Shape()
  squirclePath(shape, -half, -half, size, size, r)
  const hole = new THREE.Path()
  squirclePath(hole, -(half - lip), -(half - lip), size - lip * 2, size - lip * 2, r - lip)
  shape.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 24,
    steps: 1,
  })
  const topZ = CERAMIC_FACE_Z - 0.0001 - ISLAND_FACE_Z
  geometry.translate(0, 0, topZ - depth)
  return geometry
}

/** Perimeter bezel ring with a display opening cut for the front glass. */
export function createFrameRingGeometry(): THREE.BufferGeometry {
  const outer = new THREE.Shape()
  roundedRectPath(outer, -DIM.w / 2, -DIM.h / 2, DIM.w, DIM.h, 0.0042)
  const inner = new THREE.Path()
  roundedRectPath(
    inner,
    -DIM.w / 2 + BEZEL * 0.95,
    -DIM.h / 2 + BEZEL * 0.95,
    DIM.w - BEZEL * 1.9,
    DIM.h - BEZEL * 1.9,
    0.0012,
  )
  outer.holes.push(inner)
  const geometry = new THREE.ExtrudeGeometry(outer, {
    depth: RING_DEPTH,
    bevelEnabled: true,
    bevelSize: 0.00016,
    bevelThickness: 0.00013,
    bevelSegments: 3,
    curveSegments: 20,
    steps: 1,
  })
  geometry.translate(0, 0, RING_BASE_Z)
  return geometry
}

/** Chamfered solid frame body: the extruded spine with beveled front and rear rims. */
export function createFrameBodyGeometry(backFaceZ: number): THREE.BufferGeometry {
  const bevelSize = 0.0007
  const shape = new THREE.Shape()
  roundedRectPath(
    shape,
    -DIM.w / 2 + bevelSize,
    -DIM.h / 2 + bevelSize,
    DIM.w - bevelSize * 2,
    DIM.h - bevelSize * 2,
    0.0035,
  )
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: FRAME_BODY_DEPTH - bevelSize * 2,
    bevelEnabled: true,
    bevelSize,
    bevelThickness: 0.0005,
    bevelSegments: 3,
    curveSegments: 20,
    steps: 1,
  })
  geometry.translate(0, 0, backFaceZ + 0.0005)
  return geometry
}

/** Centered rounded-rectangle extrusion with optional chamfered end lips. */
export function createRoundedRectGeometry(
  w: number,
  h: number,
  radius: number,
  depth: number,
  bevelSize = 0,
  bevelThickness = 0,
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  roundedRectPath(shape, -w / 2, -h / 2, w, h, radius)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelSize > 0,
    bevelSize,
    bevelThickness,
    bevelSegments: 2,
    curveSegments: 16,
    steps: 1,
  })
  geometry.translate(0, 0, -depth / 2)
  return geometry
}

/** Centered rounded-rectangle slab with soft bevels. Replaces a rounded box. */
export function createSlabGeometry(
  w: number,
  h: number,
  depth: number,
  r: number,
  bevel = 0.0002,
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  roundedRectPath(shape, -w / 2, -h / 2, w, h, r)
  const body = Math.max(0.0001, depth - bevel * 2)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: body,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 12,
    steps: 1,
  })
  geometry.translate(0, 0, -(body / 2 + bevel))
  return geometry
}

/** Builds the shared static geometries for one phone instance. Caller disposes. */
export function createPhoneGeometries(backFaceZ: number): {
  island: THREE.BufferGeometry
  islandSeat: THREE.BufferGeometry
  frameBody: THREE.BufferGeometry
  frameRing: THREE.BufferGeometry
} {
  return {
    island: createSquircleGeometry(ISLAND.size, ISLAND.size, ISLAND.depth),
    islandSeat: createSeatRingGeometry(ISLAND_SEAT.size, ISLAND_SEAT.lip, ISLAND_SEAT.depth),
    frameBody: createFrameBodyGeometry(backFaceZ),
    frameRing: createFrameRingGeometry(),
  }
}

/** Disposes every geometry in the set. Safe to call once per owner. */
export function disposeGeometries(set: { [key: string]: THREE.BufferGeometry }): void {
  for (const geometry of Object.values(set)) geometry.dispose()
}
