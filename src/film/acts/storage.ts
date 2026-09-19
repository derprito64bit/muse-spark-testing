import { key, type FilmKey } from '../key.ts'

/** Storage: the phone settles to one side, editorial numerals take the other. */
export const STORAGE_KEYS: FilmKey[] = [
  key({
    at: 0.86,
    pose: { rx: -0.03, ry: 0.2, rz: 0, scale: 1.16, px: -0.16, py: 0.01 },
    camera: { pos: [0.3, 0.01, 0.6], target: [0, 0, 0] },
    lens: { fov: 22, fit: 0.56 },
    look: { exposure: 1 },
  }),
]
