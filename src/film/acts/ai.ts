import { key, type FilmKey } from '../key.ts'

/** Intelligence: the phone holds to one side, on-device copy takes the other. */
export const AI_KEYS: FilmKey[] = [
  key({
    at: 0.95,
    pose: { rx: -0.12, ry: 0.28, rz: 0, scale: 1.14, px: -0.1, py: 0.01 },
    camera: { pos: [0.26, 0.01, 0.66], target: [-0.03, 0, 0] },
    lens: { fov: 21, fit: 0.56 },
    look: { exposure: 1 },
  }),
]
