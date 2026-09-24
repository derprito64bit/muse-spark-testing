/**
 * On-screen extent of a device bounding box in metres, projected onto the
 * camera's image plane (round 03 Part A.6.2). The world-axis silhouette
 * functions are correct only while the camera looks along world -Z; the
 * teardown looks down from above, where they under-report by about 6x.
 *
 * Pure math, no three: euler order matches `group.rotation.set(rx, ry, rz)`
 * (three.js default 'XYZ', i.e. v' = Rx(Ry(Rz v))). Unit tested.
 */

export type V3 = readonly [number, number, number]

export interface BoxDims {
  w: number
  h: number
  t: number
}

function sub(a: V3, b: V3, out: [number, number, number]): [number, number, number] {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
  return out
}

function cross(a: V3, b: V3, out: [number, number, number]): [number, number, number] {
  out[0] = a[1] * b[2] - a[2] * b[1]
  out[1] = a[2] * b[0] - a[0] * b[2]
  out[2] = a[0] * b[1] - a[1] * b[0]
  return out
}

function norm(v: [number, number, number]): [number, number, number] {
  const m = Math.hypot(v[0], v[1], v[2])
  if (m > 1e-12) {
    v[0] /= m
    v[1] /= m
    v[2] /= m
  } else {
    v[0] = 0
    v[1] = 0
    v[2] = 1
  }
  return v
}

function dot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

// Module scratch: the single useFrame caller must not allocate (round 01).
const S_FWD: [number, number, number] = [0, 0, 1]
const S_RIGHT: [number, number, number] = [1, 0, 0]
const S_UP: [number, number, number] = [0, 1, 0]
const S_CORNER: [number, number, number] = [0, 0, 0]
const S_A: [number, number, number] = [0, 0, 0]
const S_B: [number, number, number] = [0, 0, 0]
const S_POSED: [number, number, number] = [0, 0, 0]
const WORLD_UP: V3 = [0, 1, 0]

function rotZ(v: V3, a: number, out: [number, number, number]): [number, number, number] {
  const c = Math.cos(a)
  const s = Math.sin(a)
  out[0] = c * v[0] - s * v[1]
  out[1] = s * v[0] + c * v[1]
  out[2] = v[2]
  return out
}

function rotY(v: V3, a: number, out: [number, number, number]): [number, number, number] {
  const c = Math.cos(a)
  const s = Math.sin(a)
  out[0] = c * v[0] + s * v[2]
  out[1] = v[1]
  out[2] = -s * v[0] + c * v[2]
  return out
}

function rotX(v: V3, a: number, out: [number, number, number]): [number, number, number] {
  const c = Math.cos(a)
  const s = Math.sin(a)
  out[0] = v[0]
  out[1] = c * v[1] - s * v[2]
  out[2] = s * v[1] + c * v[2]
  return out
}

export interface ProjectedExtents {
  horizontalM: number
  verticalM: number
}

/**
 * Spread of the scaled, posed body box on the camera image plane. Writes
 * into `out`, reusing module scratch: zero allocation per frame.
 * `camPos`/`target` define the view; the box sits at the origin (phone
 * group translations are handled by the caller's fit share/margins).
 */
export function projectedExtentM(
  dims: BoxDims,
  scale: number,
  rx: number,
  ry: number,
  rz: number,
  camPos: V3,
  target: V3,
  out: ProjectedExtents,
): ProjectedExtents {
  const forward = norm(sub(target, camPos, S_FWD))
  const right = cross(forward, WORLD_UP, S_RIGHT)
  if (Math.hypot(right[0], right[1], right[2]) < 1e-6) {
    right[0] = 1
    right[1] = 0
    right[2] = 0
  }
  const rightN = norm(right)
  const upN = norm(cross(rightN, forward, S_UP))
  let minH = Infinity
  let maxH = -Infinity
  let minV = Infinity
  let maxV = -Infinity
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        S_CORNER[0] = (sx * dims.w * scale) / 2
        S_CORNER[1] = (sy * dims.h * scale) / 2
        S_CORNER[2] = (sz * dims.t * scale) / 2
        // Ping-pong temps: no stage may read and write the same array.
        const posed = rotX(rotY(rotZ(S_CORNER, rz, S_A), ry, S_B), rx, S_POSED)
        const h = dot(posed, rightN)
        const v = dot(posed, upN)
        if (h < minH) minH = h
        if (h > maxH) maxH = h
        if (v < minV) minV = v
        if (v > maxV) maxV = v
      }
    }
  }
  out.horizontalM = maxH - minH
  out.verticalM = maxV - minV
  return out
}
