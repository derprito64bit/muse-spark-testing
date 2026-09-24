import * as THREE from 'three'
import { roundedRectPoints } from '../../lib/rounded-rect.ts'
import {
  BEZEL,
  BEZEL_SURFACE,
  CORNER_R,
  CHAMFER,
  DIM,
  RING_BASE_Z,
  RING_DEPTH,
} from './phoneDimensions.ts'

/**
 * Body outline loop: rounded rect with the frozen corner radius, sampled
 * by polar angle (+X start, monotone CCW, 4 * perQuadrant points). The old
 * superellipse family is retired (round 02): its ever-curving sides bowed
 * outward along their whole length and read as a pebble, not a phone.
 * Inner holes inset the corner radius by the ledge so the band stays a
 * uniform width through the corners.
 */
export function bodyOutlinePoints(
  halfW: number,
  halfH: number,
  cornerR: number,
  perQuadrant: number,
): Array<[number, number]> {
  return roundedRectPoints(halfW, halfH, cornerR, perQuadrant)
}

/** Builds a closed THREE.Shape from a rounded-rect body outline. */
export function bodyOutlineShape(
  halfW: number,
  halfH: number,
  cornerR: number,
  perQuadrant = 64,
): THREE.Shape {
  const shape = new THREE.Shape()
  const pts = bodyOutlinePoints(halfW, halfH, cornerR, perQuadrant)
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
 * Frame-to-back panel gap: a recessed dark hairline following the top (or
 * bottom) edge rail to rail, corners included. A straight box of phone
 * width pokes 5mm past each rounded corner (round 02 poke-out fix), so the
 * strip is built from the body outline itself: the top band of loop
 * points, ribboned inward. Flat, facing -Z (the back viewer).
 */
export function createPanelGapGeometry(top: boolean): THREE.BufferGeometry {
  const sign = top ? 1 : -1
  const loop = bodyOutlinePoints(DIM.w / 2, DIM.h / 2, CORNER_R, 64)
  const band = loop.filter(([, y]) => sign * y > DIM.h / 2 - 0.004)
  const width = 0.00012
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const m = band.length
  for (let i = 0; i < m; i++) {
    const a = band[i] as [number, number]
    const b = band[(i + 1) % m] as [number, number]
    // Inward = toward centroid (origin), in plane.
    const inA = inward(a)
    const inB = inward(b)
    quad(a, inA, inB, b)
  }
  function inward(p: [number, number]): [number, number] {
    const len = Math.hypot(p[0], p[1]) || 1
    return [p[0] - (p[0] / len) * width, p[1] - (p[1] / len) * width]
  }
  function quad(
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
  ): void {
    // Wound for a -Z normal (back viewer).
    const z = 0
    const tris: Array<[number, number]> = [p0, p2, p3, p0, p1, p2]
    for (const [x, y] of tris) {
      positions.push(x, y, z)
      normals.push(0, 0, -1)
      uvs.push(x, y)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return geometry
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
  const outer = bodyOutlinePoints(DIM.w / 2, DIM.h / 2, CORNER_R, perQuadrant)
  // Display opening as an inset rounded rect, not a rounded rect of fixed
  // radius: insetting the corner radius by the ledge keeps the lid strip a
  // uniform width all the way around. Phase-compatible by construction
  // (+X start, monotone CCW), so the annulus never pinwheels.
  const ledge = BEZEL * 0.95
  const inner = bodyOutlinePoints(
    DIM.w / 2 - ledge,
    DIM.h / 2 - ledge,
    Math.max(0.0005, CORNER_R - ledge),
    perQuadrant,
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
 * Circular module base (Prompt A2). Lathe profile with a smooth G1 base
 * fillet into the rear panel: the pad-to-panel transition is one machined
 * surface, not a flat chamfer. Bottom left open (seated inside the body).
 */
export function createModuleBaseGeometry(
  radius: number,
  height: number,
  fillet: number,
  segments = 96,
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  const steps = 12
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (Math.PI / 2)
    points.push(
      new THREE.Vector2(radius - fillet + fillet * Math.sin(t), fillet - fillet * Math.cos(t)),
    )
  }
  points.push(new THREE.Vector2(radius, height))
  return new THREE.LatheGeometry(points, segments)
}

/**
 * Display bezel ink ring: rounded-rect outline with a rounded-rect opening
 * for the active area, feathered by the grain map's alpha falloff. Sits
 * under the front glass (BEZEL_SURFACE.z) so the glass reflection passes
 * over it unbroken. The opening insets the corner radius by the band so
 * the ink band is a uniform width, corners included.
 */
export function createBezelGeometry(
  outerHW: number,
  outerHH: number,
  innerHW: number,
  innerHH: number,
): THREE.BufferGeometry {
  const band = Math.max(0.0005, Math.min(outerHW - innerHW, outerHH - innerHH))
  const shape = bodyOutlineShape(outerHW, outerHH, CORNER_R, 64)
  const holePts = bodyOutlinePoints(innerHW, innerHH, CORNER_R - band, 64)
  const hole = new THREE.Path()
  const first = holePts[0]
  if (first !== undefined) {
    hole.moveTo(first[0], first[1])
    for (let i = 1; i < holePts.length; i++) {
      const p = holePts[i]
      if (p !== undefined) hole.lineTo(p[0], p[1])
    }
    hole.closePath()
  }
  shape.holes.push(hole)
  const geometry = new THREE.ShapeGeometry(shape, 16)
  geometry.translate(0, 0, BEZEL_SURFACE.z)
  return geometry
}

/**
 * Centered rounded-rect slab with soft bevels. Front glass, display, and
 * back panel share the body outline: the glass extends out to meet the
 * rail overhang with a slight uniform gap, corners included.
 */
export function roundedRectSlabGeometry(
  halfW: number,
  halfH: number,
  depth: number,
  bevel: number,
): THREE.BufferGeometry {
  const shape = bodyOutlineShape(halfW, halfH, CORNER_R, 64)
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

/** Chamfered solid frame body: rounded-rect spine with beveled rims. */
export function createFrameBodyGeometry(backFaceZ: number, coarse = false): THREE.BufferGeometry {
  // Tile exactly: rear face at backFaceZ, top face flush with the ring base
  // so no groove reads edge-on. Depth derives from the planes, not a const.
  const bevelSize = CHAMFER.body
  const bevelThickness = 0.0006
  const shape = bodyOutlineShape(
    DIM.w / 2 - bevelSize,
    DIM.h / 2 - bevelSize,
    Math.max(0.0005, CORNER_R - bevelSize),
    coarse ? 32 : 64,
  )
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0001, RING_BASE_Z - backFaceZ - bevelThickness * 2),
    bevelEnabled: true,
    bevelSize,
    bevelThickness,
    bevelSegments: 4,
    curveSegments: coarse ? 10 : 20,
    steps: 1,
  })
  geometry.translate(0, 0, backFaceZ + bevelThickness)
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
