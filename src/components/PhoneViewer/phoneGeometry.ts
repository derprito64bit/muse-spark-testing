import * as THREE from 'three'
import { superellipsePoints } from '../../lib/superellipse.ts'
import {
  BEZEL,
  BODY_N,
  CHAMFER,
  DIM,
  FRAME_BODY_DEPTH,
  ISLAND_N,
  RING_BASE_Z,
  RING_DEPTH,
} from './phoneDimensions.ts'

let bodyNOverride: number | null = null

/**
 * Body superellipse exponent, tunable by eye via `?bodyN=` (Prompt A
 * section 3: tune, then freeze). Frozen at BODY_N = 5.0; the query param
 * exists only for the tuning session, clamped to the sane range.
 */
export function bodyExponent(): number {
  if (bodyNOverride === null) {
    let parsed = Number.NaN
    try {
      const raw = new URLSearchParams(window.location.search).get('bodyN')
      parsed = raw === null ? Number.NaN : Number.parseFloat(raw)
    } catch {
      parsed = Number.NaN
    }
    bodyNOverride = Number.isFinite(parsed) ? Math.min(6, Math.max(2, parsed)) : BODY_N
  }
  return bodyNOverride
}

/** Builds a closed THREE.Shape from a superellipse outline. */
export function superellipseShape(
  halfW: number,
  halfH: number,
  n: number,
  perQuadrant = 48,
): THREE.Shape {
  const shape = new THREE.Shape()
  const pts = superellipsePoints(halfW, halfH, n, perQuadrant)
  const first = pts[0]
  if (first === undefined) return shape
  shape.moveTo(first[0], first[1])
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]
    if (p !== undefined) shape.lineTo(p[0], p[1])
  }
  shape.closePath()
  return shape
}

/**
 * Traces a centered rounded-square outline with corner radius r. Kept for
 * genuinely rectangular parts (buttons, trays, collars). Body outlines use
 * the superellipse instead: circular-arc corners carry a curvature
 * discontinuity that reads as cheap plastic.
 */
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

/**
 * Perimeter bezel ring with a display opening, built as an explicit annulus:
 * front lid strip, outer wall, outer chamfer band, and inner hole walls.
 * A holed ExtrudeGeometry is not used because earcut drops dense holes
 * against a dense superellipse outer (the ring rendered as a solid plate;
 * see ringHole.test.ts). Every triangle here is constructed, so the
 * opening exists by construction. Outer and inner loops are angle-matched
 * (same ray from the center hits both at the same index), which keeps the
 * strip quads clean with no twisting.
 */
export function createFrameRingGeometry(coarse = false): THREE.BufferGeometry {
  const perQuadrant = coarse ? 32 : 64
  const total = perQuadrant * 4
  const outer = superellipsePoints(DIM.w / 2, DIM.h / 2, bodyExponent(), perQuadrant)
  const inner = roundedRectLoop(
    -DIM.w / 2 + BEZEL * 0.95,
    -DIM.h / 2 + BEZEL * 0.95,
    DIM.w - BEZEL * 1.9,
    DIM.h - BEZEL * 1.9,
    0.0012,
    total,
  )
  const zBack = RING_BASE_Z
  const zFront = RING_BASE_Z + RING_DEPTH
  const chamfer = CHAMFER.glassMeet
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  const push = (
    p: [number, number, number],
    n: [number, number, number],
    uv: [number, number],
  ): void => {
    positions.push(p[0], p[1], p[2])
    normals.push(n[0], n[1], n[2])
    uvs.push(uv[0], uv[1])
  }
  const tri = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number],
    na: [number, number, number],
    nb: [number, number, number],
    nc: [number, number, number],
    uva: [number, number],
    uvb: [number, number],
    uvc: [number, number],
  ): void => {
    push(a, na, uva)
    push(b, nb, uvb)
    push(c, nc, uvc)
  }
  // Smooth in-plane normals around a loop, for rail walls without faceting.
  const loopNormals = (loop: Array<[number, number]>): Array<[number, number]> =>
    loop.map(([,], i) => {
      const prev = loop[(i - 1 + loop.length) % loop.length] as [number, number]
      const next = loop[(i + 1) % loop.length] as [number, number]
      const tx = (next[0] ?? 0) - (prev[0] ?? 0)
      const ty = (next[1] ?? 0) - (prev[1] ?? 0)
      const len = Math.hypot(tx, ty) || 1
      return [-ty / len, tx / len]
    })

  // Smooth normals around each loop. loopNormals returns the left of
  // travel; both loops run CCW, so the outer wall normals are negated to
  // face outward while the hole walls keep the inward direction.
  const outerNormals = loopNormals(outer).map(([x, y]): [number, number] => [-x, -y])
  const innerNormals = loopNormals(inner)
  for (let i = 0; i < total; i++) {
    const j = (i + 1) % total
    const o0 = outer[i] as [number, number]
    const o1 = outer[j] as [number, number]
    const h0 = inner[i] as [number, number]
    const h1 = inner[j] as [number, number]
    const n0 = outerNormals[i] as [number, number]
    const n1 = outerNormals[j] as [number, number]
    const m0 = innerNormals[i] as [number, number]
    const m1 = innerNormals[j] as [number, number]
    // Lid outer edge pulled inboard so the chamfer band replaces the strip.
    const q0: [number, number] = [o0[0] - n0[0] * chamfer, o0[1] - n0[1] * chamfer]
    const q1: [number, number] = [o1[0] - n1[0] * chamfer, o1[1] - n1[1] * chamfer]
    const front: [number, number, number] = [0, 0, 1]
    const F0: [number, number, number] = [q0[0], q0[1], zFront]
    const F1: [number, number, number] = [q1[0], q1[1], zFront]
    const G0: [number, number, number] = [h0[0], h0[1], zFront]
    const G1: [number, number, number] = [h1[0], h1[1], zFront]
    const B0: [number, number, number] = [o0[0], o0[1], zBack]
    const B1: [number, number, number] = [o1[0], o1[1], zBack]
    const H0: [number, number, number] = [h0[0], h0[1], zBack]
    const H1: [number, number, number] = [h1[0], h1[1], zBack]
    const W0: [number, number, number] = [o0[0], o0[1], zFront - chamfer]
    const W1: [number, number, number] = [o1[0], o1[1], zFront - chamfer]
    const lidUv = (p: [number, number]): [number, number] => [p[0], p[1]]
    // Front annulus lid, facing the viewer.
    tri(F0, G0, G1, front, front, front, lidUv(q0), lidUv(h0), lidUv(h1))
    tri(F0, G1, F1, front, front, front, lidUv(q0), lidUv(h1), lidUv(q1))
    // Outer chamfer band, 45 degrees, catching the rim highlight.
    const chamferN0 = normalize3(n0[0], n0[1], 1)
    const chamferN1 = normalize3(n1[0], n1[1], 1)
    const bandUv = (p: [number, number]): [number, number] => [p[0], p[1]]
    tri(F0, W0, W1, chamferN0, chamferN0, chamferN1, bandUv(q0), bandUv(o0), bandUv(o1))
    tri(F0, W1, F1, chamferN0, chamferN1, chamferN1, bandUv(q0), bandUv(o1), bandUv(q1))
    // Outer wall below the chamfer, smooth outward normals.
    const N0: [number, number, number] = [n0[0], n0[1], 0]
    const N1: [number, number, number] = [n1[0], n1[1], 0]
    tri(W0, B0, B1, N0, N0, N1, bandUv(o0), bandUv(o0), bandUv(o1))
    tri(W0, B1, W1, N0, N1, N1, bandUv(o0), bandUv(o1), bandUv(o1))
    // Inner hole walls, facing the opening (hidden under the glass).
    const wallH0: [number, number, number] = [m0[0], m0[1], 0]
    const wallH1: [number, number, number] = [m1[0], m1[1], 0]
    tri(G0, G1, H1, wallH0, wallH1, wallH1, lidUv(h0), lidUv(h1), lidUv(h1))
    tri(G0, H1, H0, wallH0, wallH1, wallH0, lidUv(h0), lidUv(h1), lidUv(h0))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.translate(0, 0, 0)
  return geometry
}

/** Normalizes a 3-vector. */
function normalize3(x: number, y: number, z: number): [number, number, number] {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

/**
 * Rounded-rectangle loop resampled to exactly count points by arclength,
 * starting at the +X axis to phase-match the superellipse outer.
 */
export function roundedRectLoop(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  count: number,
): Array<[number, number]> {
  const c = Math.min(r, w / 2, h / 2)
  const centers: Array<[number, number, number]> = [
    [x + w - c, y + c, -Math.PI / 2],
    [x + w - c, y + h - c, 0],
    [x + c, y + h - c, Math.PI / 2],
    [x + c, y + c, Math.PI],
  ]
  // Dense polyline: corner arcs plus the straight edges between them.
  const dense: Array<[number, number]> = []
  const perCorner = 24
  centers.forEach(([cx, cy, start]) => {
    for (let i = 0; i <= perCorner; i++) {
      const a = (start ?? 0) + (i / perCorner) * (Math.PI / 2)
      dense.push([(cx ?? 0) + Math.cos(a) * c, (cy ?? 0) + Math.sin(a) * c])
    }
  })
  // Resample uniformly by arclength, starting at the first point (+X axis).
  const lengths: number[] = [0]
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1] as [number, number]
    const b = dense[i % dense.length] as [number, number]
    lengths.push((lengths[i - 1] ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]))
  }
  const total = lengths[dense.length] ?? 1
  const out: Array<[number, number]> = []
  let seg = 0
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total
    while (seg < dense.length - 1 && (lengths[seg + 1] ?? 0) < target) seg += 1
    const a = dense[seg % dense.length] as [number, number]
    const b = dense[(seg + 1) % dense.length] as [number, number]
    const segStart = lengths[seg] ?? 0
    const segEnd = lengths[seg + 1] ?? segStart + 1
    const t = segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}

/** Superellipse camera pad. Set into the ceramic with a base fillet lip. */
export function createPlateauGeometry(
  half: number,
  depth: number,
  bevel: number,
): THREE.BufferGeometry {
  const shape = superellipseShape(half, half, ISLAND_N, 32)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 16,
    steps: 1,
  })
  geometry.translate(0, 0, -depth / 2)
  return geometry
}

/** Chamfered solid frame body: superellipse spine with beveled rims. */
export function createFrameBodyGeometry(backFaceZ: number, coarse = false): THREE.BufferGeometry {
  const bevelSize = 0.0007
  const shape = superellipseShape(
    DIM.w / 2 - bevelSize,
    DIM.h / 2 - bevelSize,
    bodyExponent(),
    coarse ? 32 : 64,
  )
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: FRAME_BODY_DEPTH - bevelSize * 2,
    bevelEnabled: true,
    bevelSize,
    bevelThickness: 0.0005,
    bevelSegments: 4,
    curveSegments: coarse ? 10 : 20,
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
  bevel: number = CHAMFER.glassMeet,
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  roundedRectPath(shape, -w / 2, -h / 2, w, h, r)
  const body = Math.max(0.0001, depth - bevel * 2)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: body,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 3,
    curveSegments: 12,
    steps: 1,
  })
  geometry.translate(0, 0, -(body / 2 + bevel))
  return geometry
}

/** Disposes every geometry in the set. Safe to call once per owner. */
export function disposeGeometries(set: { [key: string]: THREE.BufferGeometry }): void {
  for (const geometry of Object.values(set)) geometry.dispose()
}

/**
 * Splits a non-indexed extrusion into four rail groups (+X, -X, +Y, -Y) by
 * face-centroid sector, so each rail takes its own anisotropy rotation.
 * Triangles are reordered into contiguous buckets; group material indices
 * follow RAIL_KEYS order. Deterministic and allocation-light.
 */
export function assignRailGroups(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const triCount = Math.floor(position.count / 3)
  const buckets: number[][] = [[], [], [], []]
  for (let t = 0; t < triCount; t++) {
    const cx = (position.getX(t * 3) + position.getX(t * 3 + 1) + position.getX(t * 3 + 2)) / 3
    const cy = (position.getY(t * 3) + position.getY(t * 3 + 1) + position.getY(t * 3 + 2)) / 3
    const sector = Math.abs(cx) >= Math.abs(cy) ? (cx >= 0 ? 0 : 1) : cy >= 0 ? 2 : 3
    const bucket = buckets[sector]
    if (bucket !== undefined) bucket.push(t)
  }
  const names = Object.keys(geometry.attributes)
  const copies = new Map<string, THREE.BufferAttribute>()
  for (const name of names) {
    const attr = geometry.getAttribute(name) as THREE.BufferAttribute
    copies.set(name, attr.clone())
  }
  geometry.clearGroups()
  let vertex = 0
  buckets.forEach((bucket, materialIndex) => {
    for (const t of bucket) {
      for (let v = 0; v < 3; v++) {
        const s = t * 3 + v
        for (const [name, source] of copies) {
          const target = geometry.getAttribute(name) as THREE.BufferAttribute
          if (target.itemSize === 2) {
            target.setXY(vertex, source.getX(s), source.getY(s))
          } else if (target.itemSize === 3) {
            target.setXYZ(vertex, source.getX(s), source.getY(s), source.getZ(s))
          } else {
            target.setXYZW(vertex, source.getX(s), source.getY(s), source.getZ(s), source.getW(s))
          }
        }
        vertex += 1
      }
    }
    geometry.addGroup(vertex - bucket.length * 3, bucket.length * 3, materialIndex)
  })
}
