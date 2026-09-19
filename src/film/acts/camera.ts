import { key, type FilmKey } from '../key.ts'

/**
 * Camera: approach the island, turn until the rear is nearly flat-on, then
 * dive until the barrel and collar fill the frame. The macro dive keeps its
 * authored FOV; the exit key re-engages responsive fit.
 */
export const CAMERA_KEYS: FilmKey[] = [
  key({
    at: 0.56,
    pose: { rx: -0.3, ry: 1.55, rz: 0.02, scale: 1.16, px: 0, py: 0.02 },
    camera: { pos: [0.01, 0.02, 0.78], target: [0, 0, 0] },
    lens: { fov: 20, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.6,
    pose: { rx: -0.35, ry: 1.85, rz: 0.03, scale: 1.29, px: 0, py: 0.03 },
    camera: { pos: [0.012, 0.03, 0.64], target: [-0.008, 0.05, 0] },
    lens: { fov: 22, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.635,
    pose: { rx: -0.4, ry: 2.12, rz: 0.04, scale: 1.56, px: 0.002, py: 0.03 },
    camera: { pos: [-0.3499, 0.2007, 0.2069], target: [0.0168, 0.1133, 0.0002] },
    lens: { fov: 27 },
    look: { exposure: 1.1, glass: 0.3 },
  }),
  key({
    at: 0.66,
    pose: { rx: -0.42, ry: 2.85, rz: 0.05, scale: 1.92, px: 0.0035, py: 0.035 },
    camera: { pos: [0.0017, 0.216, 0.1459], target: [0.0563, 0.1418, -0.0202] },
    lens: { fov: 31 },
    look: { exposure: 1.1, glass: 0.3 },
  }),
  key({
    at: 0.685,
    pose: { rx: -0.42, ry: 2.95, rz: 0.05, scale: 2, px: 0.001, py: 0.035 },
    camera: { pos: [0.0227, 0.224, 0.1531], target: [0.0608, 0.1439, -0.0262] },
    lens: { fov: 30 },
    look: { exposure: 1.1, glass: 0.3 },
  }),
  key({
    at: 0.705,
    pose: { rx: -0.42, ry: 3.05, rz: 0.05, scale: 2.05, px: 0.001, py: 0.035 },
    camera: { pos: [0.0458, 0.2254, 0.1495], target: [0.0641, 0.1442, -0.0323] },
    lens: { fov: 29 },
    look: { exposure: 1.1, glass: 0.3 },
  }),
  key({
    at: 0.72,
    pose: { rx: -0.3, ry: 1.85, rz: 0.03, scale: 1.3, px: 0, py: 0.025 },
    camera: { pos: [0.01, 0.03, 0.28], target: [0, 0.01, 0] },
    lens: { fov: 24, fit: 0.5 },
    look: { exposure: 1, glass: 0.5 },
  }),
]
