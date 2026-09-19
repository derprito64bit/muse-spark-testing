import { key, type FilmKey } from '../key.ts'

/** Settle: the title breathes, then the camera leans in. */
export const SETTLE_KEYS: FilmKey[] = [
  key({
    at: 0.155,
    pose: { rx: -0.2, ry: 0.2, rz: 0, scale: 1.07, px: 0, py: 0.01 },
    camera: { pos: [0, 0.01, 0.85], target: [0, 0, 0] },
    lens: { fov: 17, fit: 0.62 },
    look: { exposure: 1 },
  }),
]
