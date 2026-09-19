import { key, type FilmKey } from '../key.ts'

/** Software: front and centered, the screen is the interface. */
export const SOFTWARE_KEYS: FilmKey[] = [
  key({
    at: 0.93,
    pose: { rx: -0.02, ry: 0, rz: 0, scale: 1.28, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.55], target: [0, 0, 0] },
    lens: { fov: 26, fit: 0.62 },
    look: { exposure: 1, glass: 0.6 },
  }),
]
