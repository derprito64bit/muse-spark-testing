import { key, type FilmKey } from '../key.ts'

/** Display: turn to front, the screen takes over. */
export const DISPLAY_KEYS: FilmKey[] = [
  key({
    at: 0.76,
    pose: { rx: -0.15, ry: 0.9, rz: 0, scale: 1.2, px: 0, py: 0.02 },
    camera: { pos: [0, 0.02, 0.62], target: [0, 0, 0] },
    lens: { fov: 21, fit: 0.6 },
    look: { exposure: 1.05, glass: 0.7 },
  }),
  key({
    at: 0.79,
    pose: { rx: -0.03, ry: 0.1, rz: 0, scale: 1.3, px: 0, py: 0.01 },
    camera: { pos: [0, 0.01, 0.56], target: [0, 0, 0] },
    lens: { fov: 24, fit: 0.64 },
    look: { exposure: 1.05, glass: 0.7 },
  }),
  key({
    at: 0.82,
    pose: { rx: 0, ry: 0, rz: 0, scale: 1.47, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.49], target: [0, 0, 0] },
    lens: { fov: 28, fit: 0.66 },
    look: { exposure: 1.05, glass: 0.7 },
  }),
]
