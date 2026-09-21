import { key, type FilmKey } from '../key.ts'

/**
 * Camera: approach the module, turn until the rear is nearly flat-on, then
 * dive until the barrel and collar fill the frame. Macro keys are anchored
 * to the module center (0, 0.0458); the relative dive is preserved exactly
 * so the move keeps its authored feel. Re-aimed rigidly from the old
 * offset-plateau framing: each key's pos and target shift by the world-space
 * delta of the anchor move under that key's own pose, so angles and travel
 * are unchanged. The macro dive keeps its authored FOV.
 */
export const CAMERA_KEYS: FilmKey[] = [
  key({
    at: 0.56,
    pose: { rx: -0.3, ry: 1.55, rz: 0.02, scale: 1.16, px: 0, py: 0.02 },
    camera: { pos: [-0.0106, 0.0096, 0.7579], target: [-0.0206, -0.0104, -0.0221] },
    lens: { fov: 20, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.6,
    pose: { rx: -0.35, ry: 1.85, rz: 0.03, scale: 1.29, px: 0, py: 0.03 },
    camera: { pos: [0.0037, 0.0149, 0.6169], target: [-0.0163, 0.0349, -0.0231] },
    lens: { fov: 22, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.635,
    pose: { rx: -0.4, ry: 2.12, rz: 0.04, scale: 1.56, px: 0.002, py: 0.03 },
    camera: { pos: [-0.3686, 0.1817, 0.1831], target: [-0.0019, 0.0943, -0.0236] },
    lens: { fov: 27 },
    look: { exposure: 1, glass: 0.3 },
  }),
  key({
    at: 0.66,
    pose: { rx: -0.42, ry: 2.85, rz: 0.05, scale: 1.92, px: 0.0035, py: 0.035 },
    camera: { pos: [-0.0413, 0.201, 0.1387], target: [0.0133, 0.1268, -0.0274] },
    lens: { fov: 31 },
    // Macro sits a third of a stop below hero so collar highlights never clip.
    look: { exposure: 0.8, glass: 0.3 },
  }),
  key({
    at: 0.685,
    pose: { rx: -0.42, ry: 2.95, rz: 0.05, scale: 2, px: 0.001, py: 0.035 },
    camera: { pos: [-0.0233, 0.21, 0.1496], target: [0.0148, 0.1299, -0.0297] },
    lens: { fov: 30 },
    look: { exposure: 0.8, glass: 0.3 },
  }),
  key({
    at: 0.705,
    pose: { rx: -0.418, ry: 2.96, rz: 0.05, scale: 2.01, px: 0.001, py: 0.035 },
    camera: { pos: [-0.0233, 0.21, 0.1496], target: [0.0148, 0.1299, -0.0297] },
    lens: { fov: 30 },
    look: { exposure: 0.8, glass: 0.3 },
  }),
  // Hold 0.685 to 0.705: camera locked so the coating shift and baffle
  // rings have a moment to be looked at (Prompt B section 5.2).
  key({
    at: 0.7125,
    pose: { rx: -0.353, ry: 2.35, rz: 0.039, scale: 1.62, px: 0.0004, py: 0.0295 },
    camera: { pos: [-0.0219, 0.1014, 0.2017], target: [-0.0103, 0.0544, -0.033] },
    lens: { fov: 27 },
    look: { exposure: 0.9, glass: 0.4 },
  }),
  key({
    at: 0.72,
    pose: { rx: -0.3, ry: 1.85, rz: 0.03, scale: 1.3, px: 0, py: 0.025 },
    camera: { pos: [-0.0191, 0.018, 0.2558], target: [-0.0291, -0.002, -0.0242] },
    lens: { fov: 24, fit: 0.5 },
    look: { exposure: 1, glass: 0.5 },
  }),
]
