import type { Group } from 'three'
import { DIM } from '../../components/PhoneViewer/phoneDimensions.ts'
import {
  FEATURE_OFFSET,
  FLIP,
  LAYER_GAP,
  LAYER_GAP_COMPACT,
  featureFrame,
  layerOffset,
  type FeatureFrame,
  type TeardownLayer,
} from './layers.ts'
function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

/**
 * One teardown layer's slot-plus-feature-gesture transform (round 03
 * A.6.4). Both drivers — FilmDirector's shell groups and Internals' parts
 * — implement this separately with different names; that duplication is
 * how layer bugs survive review. Goals converge, so rest is exact.
 *
 * `slotZ` overrides the slot for nested groups: the camera module is a
 * child of `back`, so its slot is slot(8) minus slot(9). Callers own spin
 * (screws) on top of the written rotation.
 *
 * Writes into `group`, reusing the caller's `frame` scratch: zero
 * allocation per frame.
 */
export function applyLayerTransform(
  group: Group,
  layer: TeardownLayer,
  cursor: number,
  sep: number,
  gap: number,
  damp: number,
  reduced: boolean,
  frame: FeatureFrame,
  slotZ?: number,
): void {
  featureFrame(clamp01(cursor - layer.index), layer.weight, frame, reduced)
  const off = slotZ ?? layerOffset(layer.index, 10, gap, sep)
  // Scale about the hero pivot, not the group origin (overnight fix):
  // part groups carry layout offsets, and scaling those about the phone
  // origin displaces the hero by (scale-1) × offset. Counter-translate by
  // the flipped pivot so the featured part stays centered. Exact at rest
  // (scale 1 → no compensation).
  const bumpScale =
    1 + (layer.featureScale - 1) * frame.scale * (gap <= LAYER_GAP_COMPACT ? 0.85 : 1)
  const theta = FLIP.x * frame.turn
  const cosT = Math.cos(theta)
  const sinT = Math.sin(theta)
  const k = bumpScale - 1
  const gx = FEATURE_OFFSET.x * frame.detach - k * layer.heroPivot[0]
  const gy = FEATURE_OFFSET.y * frame.detach - k * (layer.heroPivot[1] * cosT)
  const gz = off + FEATURE_OFFSET.z * frame.detach - k * (layer.heroPivot[1] * sinT)
  // Snap on jumps (overnight fling fix): smooth scroll moves goals
  // sub-millimeter per frame and damps invisibly; a flick moves them
  // centimeters, and damping toward a receding goal is what reads as
  // parts flying everywhere on reverse. Snapping past 10mm keeps every
  // frame exact with no lag pile-up. Rotation/scale are set directly
  // below, so they cannot lag at any speed.
  const travel = Math.hypot(gx - group.position.x, gy - group.position.y, gz - group.position.z)
  const d = travel > 0.01 ? 1 : damp
  group.position.x += (gx - group.position.x) * d
  group.position.y += (gy - group.position.y) * d
  group.position.z += (gz - group.position.z) * d
  group.rotation.set(FLIP.x * frame.turn, FLIP.y * frame.turn, FLIP.z * frame.turn)
  // Compact viewports shrink the hero bump so the layer never crops (the
  // gap comparison above already selected it into bumpScale).
  group.scale.setScalar(bumpScale)
}

type V3 = readonly [number, number, number]

function vsub(a: V3, b: V3): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function vnorm(v: [number, number, number]): [number, number, number] {
  const m = Math.hypot(v[0], v[1], v[2])
  return m > 1e-12 ? [v[0] / m, v[1] / m, v[2] / m] : [0, 0, 1]
}

function vdot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function vrotX(v: V3, a: number): [number, number, number] {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]]
}

function vrotY(v: V3, a: number): [number, number, number] {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]]
}

export interface StackProjection {
  /** Camera elevation above the target plane, degrees. */
  elevationDeg: number
  /** Stack-axis share wasted into view depth (target < 0.50). */
  intoDepth: number
  /** Stack-axis share on screen-vertical (target > 0.85). */
  onScreenUp: number
  /** Separated stack height on screen, mm. */
  stackHeightMm: number
  /** One plate's vertical extent on screen, mm. */
  plateHeightMm: number
  /** Stack over plate (target > 0.65: the >0.80 bar contradicts the
   * protected 8.5mm gap, whose ceiling is ~0.70 — user ruling 2026-09-22). */
  ratio: number
}

/**
 * How the separated stack projects for a posed device and camera (round
 * 03 Part A acceptance 1-4). Pure math over the sampled timeline: the
 * K.3 probe script as a unit test, no renderer.
 */
export function stackProjection(
  rx: number,
  ry: number,
  scale: number,
  camPos: V3,
  target: V3,
): StackProjection {
  const view = vnorm(vsub(target, camPos))
  const elevationDeg = (Math.asin(Math.min(1, Math.max(-1, -view[1]))) * 180) / Math.PI
  const k = vdot([0, 1, 0], view)
  const up = vnorm([0 - k * view[0], 1 - k * view[1], 0 - k * view[2]])
  const stack = vnorm(vrotY(vrotX([0, 0, 1], rx), ry))
  const long = vnorm(vrotY(vrotX([0, 1, 0], rx), ry))
  const onUp = Math.abs(vdot(stack, up))
  const stackH = 9 * LAYER_GAP * onUp
  const plateH = scale * DIM.h * Math.abs(vdot(long, up))
  return {
    elevationDeg,
    intoDepth: Math.abs(vdot(stack, view)),
    onScreenUp: onUp,
    stackHeightMm: stackH * 1000,
    plateHeightMm: plateH * 1000,
    ratio: plateH > 1e-9 ? stackH / plateH : 0,
  }
}
