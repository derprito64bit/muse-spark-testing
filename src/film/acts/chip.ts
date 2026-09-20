import { key, type FilmKey } from '../key.ts'

/**
 * Chip: the A1 Ultra becomes the subject. The camera settles onto the board,
 * the die lifts out of the plane, then the lens goes near-orthographic and
 * flat-on so the package owns the frame. Detail shots keep authored FOV.
 */
export const CHIP_KEYS: FilmKey[] = [
  key({
    at: 0.36,
    pose: { rx: -0.52, ry: 0.2, rz: 0, scale: 1.6, px: 0, py: 0.045 },
    camera: { pos: [0.012, 0.11, 0.24], target: [0.011, 0.097, 0.02] },
    lens: { fov: 24, fovMax: 48 },
    look: { exposure: 1.15, glass: 0.2 },
  }),
  key({
    at: 0.39,
    pose: { rx: -0.45, ry: 0.13, rz: 0, scale: 1.78, px: 0, py: 0.045 },
    camera: { pos: [0.012, 0.105, 0.125], target: [0.011, 0.098, 0.025] },
    lens: { fov: 22, fovMax: 48 },
    look: { exposure: 1.2, glass: 0.2 },
  }),
  key({
    at: 0.425,
    pose: { rx: -0.35, ry: 0.1, rz: 0.02, scale: 2.02, px: 0, py: 0 },
    camera: { pos: [0.0404, 0.155, 0.128], target: [0.03, 0.12, 0.0137] },
    lens: { fov: 22, fovMax: 48 },
    look: { exposure: 1.2, glass: 0.15 },
  }),
  // Hold 0.432 to 0.440: camera locked, pose delta tiny. The die emissive
  // and trace routing carry the motion instead (Prompt B section 5.1).
  key({
    at: 0.432,
    pose: { rx: -0.34, ry: 0.09, rz: 0.02, scale: 2.02, px: 0, py: 0.015 },
    camera: { pos: [0.0375, 0.1535, 0.138], target: [0.0296, 0.1225, 0.022] },
    lens: { fov: 22, fovMax: 48 },
    look: { exposure: 1.2, glass: 0.15 },
  }),
  key({
    at: 0.44,
    pose: { rx: -0.335, ry: 0.09, rz: 0.02, scale: 2.02, px: 0, py: 0.015 },
    camera: { pos: [0.0375, 0.1535, 0.138], target: [0.0296, 0.1225, 0.022] },
    lens: { fov: 22, fovMax: 48 },
    look: { exposure: 1.2, glass: 0.15 },
  }),
  key({
    at: 0.452,
    pose: { rx: -0.26, ry: 0.05, rz: 0.02, scale: 2.02, px: 0, py: 0 },
    camera: { pos: [0.0345, 0.152, 0.148], target: [0.0292, 0.125, 0.0302] },
    lens: { fov: 21.5, fovMax: 48 },
    look: { exposure: 1.2, glass: 0.15 },
  }),
  key({
    at: 0.47,
    pose: { rx: -0.45, ry: 0.2, rz: 0, scale: 1.7, px: 0, py: 0.045 },
    camera: { pos: [0.016, 0.11, 0.3], target: [0.012, 0.095, 0.02] },
    lens: { fov: 26, fovMax: 48 },
    look: { exposure: 1.1, glass: 0.25 },
  }),
]
