import { key, type FilmKey } from '../key.ts'

/** Arrival: open already on the product. Slanted three-quarter hero, breathing in. */
export const ARRIVAL_KEYS: FilmKey[] = [
  key({
    at: 0,
    pose: { rx: -0.32, ry: 0.5, rz: 0.01, scale: 0.95, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.96], target: [0, 0, 0] },
    lens: { fov: 15, fit: 0.56 },
    look: { exposure: 1 },
  }),
  key({
    at: 0.04,
    pose: { rx: -0.3, ry: 0.43, rz: 0.01, scale: 0.97, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.94], target: [0, 0, 0] },
    lens: { fov: 15.4, fit: 0.58 },
    look: { exposure: 1 },
  }),
  key({
    at: 0.08,
    pose: { rx: -0.29, ry: 0.38, rz: 0, scale: 0.99, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.93], target: [0, 0, 0] },
    lens: { fov: 15.8, fit: 0.59 },
    look: { exposure: 1 },
  }),
  key({
    at: 0.1,
    pose: { rx: -0.28, ry: 0.35, rz: 0, scale: 1, px: 0, py: 0 },
    camera: { pos: [0, 0, 0.92], target: [0, 0, 0] },
    lens: { fov: 16, fit: 0.6 },
    look: { exposure: 1 },
  }),
]
