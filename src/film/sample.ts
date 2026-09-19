import * as THREE from 'three'
import { smoothstep, type FilmKey } from './key.ts'
import { KEYS } from './timeline.ts'

export interface FilmSample {
  /** Camera world position. */
  pos: THREE.Vector3
  /** Camera look-at target. */
  target: THREE.Vector3
  /** Author fallback vertical FOV in degrees. */
  fov: number
  /** Responsive fit share, or null to keep the authored macro FOV. */
  fit: number | null
  /** Upper FOV clamp for this sample. */
  fovMax: number
  /** Phone group pose. */
  rx: number
  ry: number
  rz: number
  scale: number
  px: number
  py: number
  /** Lighting look channels. */
  exposure: number
  glass: number
}

/** Locates the authored segment at progress p with the eased local parameter. */
function findSegment(p: number): { a: FilmKey; b: FilmKey; t: number; ia: number; ib: number } {
  const first = KEYS[0]
  if (first === undefined) throw new Error('KEYS must not be empty')
  if (p <= first.at) return { a: first, b: first, t: 0, ia: 0, ib: 0 }
  for (let i = 1; i < KEYS.length; i++) {
    const b = KEYS[i]
    const a = KEYS[i - 1]
    if (b === undefined || a === undefined) continue
    if (p <= b.at) {
      return { a, b, t: smoothstep((p - a.at) / (b.at - a.at)), ia: i - 1, ib: i }
    }
  }
  const last = KEYS[KEYS.length - 1]
  if (last === undefined) throw new Error('KEYS must not be empty')
  return { a: last, b: last, t: 0, ia: KEYS.length - 1, ib: KEYS.length - 1 }
}

/**
 * Three's CatmullRomCurve3 uses uniform knots, so sampling at raw p lands key
 * i at u = i/(N-1) instead of at its authored at, sliding camera travel
 * against the pose and FOV timelines. Re-clocking onto the author segment
 * clock forces each key to land exactly at its authored progress.
 */
function reclockedCurveParam(p: number): number {
  const { t, ia, ib } = findSegment(p)
  return (ia + (ib - ia) * t) / (KEYS.length - 1)
}

const POS_PTS = KEYS.map((k) => new THREE.Vector3(...k.camera.pos))
const TGT_PTS = KEYS.map((k) => new THREE.Vector3(...k.camera.target))
/** Position glides looser than aim so the eye leads and settles slightly later. */
const POS_CURVE = new THREE.CatmullRomCurve3(POS_PTS, false, 'catmullrom', 0.32)
const TGT_CURVE = new THREE.CatmullRomCurve3(TGT_PTS, false, 'catmullrom', 0.42)

const OUT: FilmSample = {
  pos: new THREE.Vector3(),
  target: new THREE.Vector3(),
  fov: 0,
  fit: null,
  fovMax: 52,
  rx: 0,
  ry: 0,
  rz: 0,
  scale: 0,
  px: 0,
  py: 0,
  exposure: 1,
  glass: 0.5,
}

/**
 * Samples the master timeline at progress p. Reuses one scratch object:
 * zero allocation per frame. Camera rides the Catmull-Rom path; pose, FOV,
 * and look ease between keys.
 */
export function sampleFilm(p: number): FilmSample {
  const { a, b, t } = findSegment(p)
  POS_CURVE.getPoint(reclockedCurveParam(p), OUT.pos)
  TGT_CURVE.getPoint(reclockedCurveParam(p), OUT.target)

  OUT.rx = a.pose.rx + (b.pose.rx - a.pose.rx) * t
  OUT.ry = a.pose.ry + (b.pose.ry - a.pose.ry) * t
  OUT.rz = a.pose.rz + (b.pose.rz - a.pose.rz) * t
  OUT.scale = a.pose.scale + (b.pose.scale - a.pose.scale) * t
  OUT.px = a.pose.px + (b.pose.px - a.pose.px) * t
  OUT.py = a.pose.py + (b.pose.py - a.pose.py) * t
  OUT.fov = a.lens.fov + (b.lens.fov - a.lens.fov) * t
  OUT.exposure = a.look.exposure + (b.look.exposure - a.look.exposure) * t
  OUT.glass = a.look.glass + (b.look.glass - a.look.glass) * t

  // Responsive framing owns a segment only when both endpoints carry fit.
  OUT.fit =
    a.lens.fit != null && b.lens.fit != null ? a.lens.fit + (b.lens.fit - a.lens.fit) * t : null
  const aMax = a.lens.fovMax ?? 52
  const bMax = b.lens.fovMax ?? 52
  OUT.fovMax = aMax + (bMax - aMax) * t
  return OUT
}

/** Exposes the authored keys for tests and the dev scrubber. */
export function filmKeys(): readonly FilmKey[] {
  return KEYS
}
