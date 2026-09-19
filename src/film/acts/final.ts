import { key, type FilmKey } from '../key.ts'

/** Final: return to center, best lighting, three-quarter hero. */
export const FINAL_KEYS: FilmKey[] = [
  key({
    at: 0.975,
    pose: { rx: -0.28, ry: 0.42, rz: 0, scale: 1.34, px: 0, py: 0.02 },
    camera: { pos: [0, 0.02, 0.6], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.6 },
    look: { exposure: 1.1 },
  }),
  key({
    at: 0.98,
    pose: { rx: -0.28, ry: 0.42, rz: 0, scale: 1.34, px: 0, py: 0.02 },
    camera: { pos: [0, 0.02, 0.6], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.6 },
    look: { exposure: 1.1 },
  }),
  key({
    at: 1,
    pose: { rx: -0.26, ry: 0.4, rz: 0, scale: 1.36, px: 0, py: 0.02 },
    camera: { pos: [0, 0.02, 0.58], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.62 },
    look: { exposure: 1.1 },
  }),
]
