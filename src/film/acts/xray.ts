import { key, type FilmKey } from '../key.ts'

/** X-ray: overhead dive, the shell ghosts out, the internals surface. */
export const XRAY_KEYS: FilmKey[] = [
  key({
    at: 0.28,
    pose: { rx: -0.5, ry: 0.38, rz: 0, scale: 1.36, px: 0, py: 0.1 },
    camera: { pos: [0, 0.1, 0.56], target: [0.012, 0.02, 0] },
    lens: { fov: 24, fit: 0.55 },
    look: { exposure: 1.05, glass: 0.35 },
  }),
  key({
    at: 0.33,
    pose: { rx: -0.55, ry: 0.24, rz: 0, scale: 1.44, px: 0, py: 0.13 },
    camera: { pos: [0, 0.13, 0.5], target: [0.02, 0.06, 0] },
    lens: { fov: 28, fit: 0.5 },
    look: { exposure: 1.1, glass: 0.3 },
  }),
]
