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
    pose: { rx: -0.08, ry: 0.72, rz: 0.02, scale: 1.26, px: -0.12, py: 0.05 },
    camera: { pos: [0.2, 0.04, 0.66], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.68 },
    look: { exposure: 1 },
  }),
]
