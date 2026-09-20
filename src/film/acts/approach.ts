import { key, type FilmKey } from '../key.ts'

/** Approach: closer to the front glass, then along the titanium edge. */
export const APPROACH_KEYS: FilmKey[] = [
  key({
    at: 0.2,
    pose: { rx: -0.06, ry: 0.04, rz: 0, scale: 1.18, px: 0, py: 0.02 },
    camera: { pos: [0, 0.02, 0.68], target: [0, 0, 0] },
    lens: { fov: 20, fit: 0.66 },
    look: { exposure: 1 },
  }),
  key({
    at: 0.24,
    pose: { rx: -0.05, ry: 0.55, rz: 0.02, scale: 1.23, px: -0.14, py: 0.02 },
    camera: { pos: [0.24, 0.02, 0.74], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.7 },
    look: { exposure: 1 },
  }),
  key({
    at: 0.25,
    pose: { rx: 0.1, ry: 0.6, rz: 0.02, scale: 1.26, px: -0.1, py: -0.03 },
    camera: { pos: [0.14, -0.1, 0.64], target: [0, -0.055, 0] },
    lens: { fov: 24 },
    look: { exposure: 1 },
  }),
]
