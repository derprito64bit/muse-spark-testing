import { key, type FilmKey } from '../key.ts'

/** Rebuild: pull out of the cavity, the stack repacks, the shell closes. */
export const REBUILD_KEYS: FilmKey[] = [
  key({
    at: 0.5,
    pose: { rx: -0.34, ry: 0.7, rz: 0, scale: 1.62, px: 0, py: 0.045 },
    camera: { pos: [0.008, 0.045, 0.42], target: [0.012, 0.03, 0] },
    lens: { fov: 31, fit: 0.66 },
    look: { exposure: 1.05, glass: 0.35 },
  }),
  key({
    at: 0.52,
    pose: { rx: -0.28, ry: 1.02, rz: 0, scale: 1.28, px: 0, py: 0.025 },
    camera: { pos: [0, 0.025, 0.64], target: [0, 0, 0] },
    lens: { fov: 24, fit: 0.6 },
    look: { exposure: 1, glass: 0.5 },
  }),
]
