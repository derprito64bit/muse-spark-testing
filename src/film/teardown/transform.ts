import type { Group } from 'three'
import { DIM } from '../../components/PhoneViewer/phoneDimensions.ts'
import { LAYER_GAP, layerOffset, peelLocal, type TeardownLayer } from './layers.ts'

/**
 * Module pivot in phone-local xy: the lens-up turn rotates about the
 * module center, not the group origin (which would swing the 47mm disc
 * 92mm down the stack).
 */
const MODULE_PIVOT_Y = 0.0458

/**
 * One teardown layer's slot transform (sandwich rewrite). The layer rides
 * its peel-staggered slot offset and nothing else: position converges on
 * the slot, rotation stays zero, scale stays one. Both drivers — the
 * FilmDirector's shell groups and Internals' parts — share this helper, so
 * layer bugs cannot survive review in only one of them.
 *
 * Sole exception: the camera layer parks lens-up. It is the only layer
 * whose decorated face points away from the tour camera, so as it peels
 * it turns over about the module center — parked by full separation,
 * exactly mirrored on reverse. Nothing detaches or travels for the
 * camera; the turn is a pure function of the layer's own peel.
 *
 * `slotZ` overrides the slot for nested groups: the camera module is a
 * child of `back`, so its slot is slot(8) minus slot(9).
 *
 * Snap on jumps: smooth scroll moves goals sub-millimeter per frame and
 * damps invisibly; a flick moves them centimeters, and damping toward a
 * receding goal is what reads as parts flying everywhere on reverse.
 * Snapping past 10mm keeps every frame exact with no lag pile-up.
 */
export function applyLayerTransform(
  group: Group,
  layer: TeardownLayer,
  sep: number,
  gap: number,
  damp: number,
  slotZ?: number,
): void {
  const local = peelLocal(sep, layer.index)
  const off = slotZ ?? layerOffset(layer.index, 10, gap, local)
  let gx = 0
  let gy = 0
  let gz = off
  let turn = 0
  if (layer.id === 'camera') {
    turn = Math.PI * local
    const c = Math.cos(turn)
    const s = Math.sin(turn)
    // Turn about the pivot, then carry the slot: the module stays on its
    // slot upside-down instead of swinging to the mirrored slot.
    gy = MODULE_PIVOT_Y * (1 - c)
    gz = off - MODULE_PIVOT_Y * s
  }
  const dx = gx - group.position.x
  const dy = gy - group.position.y
  const dz = gz - group.position.z
  const travel = Math.hypot(dx, dy, dz)
  const d = travel > 0.01 ? 1 : damp
  group.position.x += dx * d
  group.position.y += dy * d
  group.position.z += dz * d
  group.rotation.set(turn, 0, 0)
  group.scale.setScalar(1)
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
