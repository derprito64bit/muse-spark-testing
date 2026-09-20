import { key, type FilmKey } from '../key.ts'

/**
 * Camera: approach the plateau, turn until the rear is nearly flat-on, then
 * dive until the barrel and collar fill the frame. Macro keys are anchored
 * to the upper-shelf center (-0.0224, 0.0548); the relative dive is
 * preserved exactly so the move keeps its authored feel. The macro dive
 * keeps its authored FOV.
 */
export const CAMERA_KEYS: FilmKey[] = [
  key({
    at: 0.56,
    pose: { rx: -0.3, ry: 1.55, rz: 0.02, scale: 1.16, px: 0, py: 0.02 },
    camera: { pos: [-0.0124, 0.0268, 0.78], target: [-0.0224, 0.0068, 0] },
    lens: { fov: 20, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.6,
    pose: { rx: -0.35, ry: 1.85, rz: 0.03, scale: 1.29, px: 0, py: 0.03 },
    camera: { pos: [0.0104, 0.0348, 0.64], target: [-0.0096, 0.0548, 0] },
    lens: { fov: 22, fit: 0.62 },
    look: { exposure: 1.05 },
  }),
  key({
    at: 0.635,
    pose: { rx: -0.4, ry: 2.12, rz: 0.04, scale: 1.56, px: 0.002, py: 0.03 },
    camera: { pos: [-0.3515, 0.2055, 0.2069], target: [0.0152, 0.1181, 0.0002] },
    lens: { fov: 27 },
    look: { exposure: 1, glass: 0.3 },
  }),
  key({
    at: 0.66,
    pose: { rx: -0.42, ry: 2.85, rz: 0.05, scale: 1.92, px: 0.0035, py: 0.035 },
    camera: { pos: [0.0001, 0.2208, 0.1459], target: [0.0547, 0.1466, -0.0202] },
    lens: { fov: 31 },
    // Macro sits a third of a stop below hero so collar highlights never clip.
    look: { exposure: 0.8, glass: 0.3 },
  }),
  key({
    at: 0.685,
    pose: { rx: -0.42, ry: 2.95, rz: 0.05, scale: 2, px: 0.001, py: 0.035 },
    camera: { pos: [0.0211, 0.2288, 0.1531], target: [0.0592, 0.1487, -0.0262] },
    lens: { fov: 30 },
    look: { exposure: 0.8, glass: 0.3 },
  }),
  key({
    at: 0.705,
    pose: { rx: -0.418, ry: 2.96, rz: 0.05, scale: 2.01, px: 0.001, py: 0.035 },
    camera: { pos: [0.0211, 0.2288, 0.1531], target: [0.0592, 0.1487, -0.0262] },
    lens: { fov: 30 },
    look: { exposure: 0.8, glass: 0.3 },
  }),
  // Hold 0.685 to 0.705: camera locked so the coating shift and baffle
  // rings have a moment to be looked at (Prompt B section 5.2).
  key({
    at: 0.7125,
    pose: { rx: -0.353, ry: 2.35, rz: 0.039, scale: 1.62, px: 0.0004, py: 0.0295 },
    camera: { pos: [0.0027, 0.1232, 0.2229], target: [0.0143, 0.0762, -0.0118] },
    lens: { fov: 27 },
    look: { exposure: 0.9, glass: 0.4 },
  }),
  key({
    at: 0.72,
    pose: { rx: -0.3, ry: 1.85, rz: 0.03, scale: 1.3, px: 0, py: 0.025 },
    camera: { pos: [-0.0124, 0.0368, 0.28], target: [-0.0224, 0.0168, 0] },
    lens: { fov: 24, fit: 0.5 },
    look: { exposure: 1, glass: 0.5 },
  }),
]
