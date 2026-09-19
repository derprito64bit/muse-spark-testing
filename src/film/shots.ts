import type { ActId } from './key.ts'

export type ShotKind = 'establishing' | 'push-in' | 'arc' | 'macro' | 'reveal'

export interface ShotProfile {
  kind: ShotKind
  /** Pose damping rate per second. */
  dampPerSecond: number
}

/**
 * Shot grammar. Every act names its move instead of inventing an easing.
 * Macro runs nearly locked off; reveals settle long; arcs hold constant
 * angular velocity with damped entry and exit.
 */
export const SHOTS: Record<ActId, ShotProfile> = {
  arrival: { kind: 'establishing', dampPerSecond: 5.5 },
  settle: { kind: 'push-in', dampPerSecond: 6 },
  approach: { kind: 'arc', dampPerSecond: 5.5 },
  xray: { kind: 'reveal', dampPerSecond: 5 },
  chip: { kind: 'macro', dampPerSecond: 3.5 },
  rebuild: { kind: 'reveal', dampPerSecond: 6 },
  camera: { kind: 'macro', dampPerSecond: 3.5 },
  display: { kind: 'push-in', dampPerSecond: 6 },
  storage: { kind: 'arc', dampPerSecond: 5.5 },
  battery: { kind: 'reveal', dampPerSecond: 5 },
  software: { kind: 'establishing', dampPerSecond: 6 },
  ai: { kind: 'arc', dampPerSecond: 5.5 },
  final: { kind: 'establishing', dampPerSecond: 5 },
}
