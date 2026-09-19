import { smoothstep } from './key.ts'

export interface FilmStates {
  /** 0..1 how far the outer shell has dissolved. */
  shellGhost: number
  /** 0..1 how far the shell layers split apart. */
  shellSplit: number
  /** 0..1 how visible the internal hardware is. */
  internalOpacity: number
  /** 0..1 how far the internals explode apart (x-ray pass). */
  explodeXray: number
  /** 0..1 how far only the battery separates (energy climax). */
  explodeBatt: number
  /** 0..1 whether the A1 Ultra is the focused subject. */
  chipFocus: number
  /** 0..1 how far the die lifts out of the board plane. */
  chipLift: number
  /** 0..1 how far the cell pulls toward camera at the climax. */
  battLift: number
  /** 0..1 how far surroundings step back behind the subject. */
  subjectDim: number
  /** 0..1 whether the camera dives on the physical lens barrels. */
  cameraFocus: number
  /** 0..1 how far shell optics spread from the rear surface. */
  optical: number
  /** 0..1 partial interior glow during the energy story. */
  energy: number
  /** 0..1 live screen brightness. */
  screenOn: number
}

/**
 * Plateau window: eases up from in1 to in2, holds until out1, eases to 0
 * by out2. The descent restores the shell and reseats the explosion.
 */
export function ramplike(p: number, in1: number, in2: number, out1: number, out2: number): number {
  const up = smoothstep((p - in1) / Math.max(1e-5, in2 - in1))
  const down = smoothstep((p - out1) / Math.max(1e-5, out2 - out1))
  return Math.min(up, 1 - down)
}

const STATES: FilmStates = {
  shellGhost: 0,
  shellSplit: 0,
  internalOpacity: 0,
  explodeXray: 0,
  explodeBatt: 0,
  chipFocus: 0,
  chipLift: 0,
  battLift: 0,
  subjectDim: 0,
  cameraFocus: 0,
  optical: 0,
  energy: 0,
  screenOn: 0,
}

/**
 * Deterministic per-progress scalars driving x-ray and internals.
 * Reuses one scratch object: zero allocation per frame.
 */
export function computeFilmStates(p: number): FilmStates {
  STATES.cameraFocus = ramplike(p, 0.635, 0.665, 0.705, 0.73)
  STATES.chipLift = ramplike(p, 0.34, 0.37, 0.455, 0.485)
  STATES.battLift = ramplike(p, 0.893, 0.91, 0.92, 0.928)
  STATES.optical = ramplike(p, 0.645, 0.675, 0.715, 0.74)
  STATES.explodeXray = ramplike(p, 0.27, 0.32, 0.485, 0.515)
  STATES.explodeBatt = ramplike(p, 0.885, 0.893, 0.905, 0.918)
  STATES.shellGhost = Math.min(
    1,
    ramplike(p, 0.25, 0.31, 0.44, 0.52) + ramplike(p, 0.875, 0.9, 0.905, 0.925),
  )
  STATES.shellSplit = ramplike(p, 0.29, 0.34, 0.47, 0.515)
  STATES.internalOpacity = Math.min(
    1,
    ramplike(p, 0.26, 0.31, 0.5, 0.518) + ramplike(p, 0.88, 0.9, 0.905, 0.93),
  )
  STATES.chipFocus = ramplike(p, 0.36, 0.445, 0.49, 0.525)
  STATES.subjectDim = Math.min(
    1,
    ramplike(p, 0.39, 0.42, 0.46, 0.485) + ramplike(p, 0.893, 0.905, 0.92, 0.928),
  )
  STATES.energy = ramplike(p, 0.885, 0.9, 0.91, 0.93)
  STATES.screenOn = ramplike(p, 0.03, 0.08, 1, 1)
  return STATES
}
