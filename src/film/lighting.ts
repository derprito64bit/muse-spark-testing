import type { ActId } from './key.ts'

export interface StageLightState {
  /** Key light intensity. */
  key: number
  /** Cool fill intensity. */
  fill: number
  /** Rim light intensity. */
  rim: number
  /** Environment reflection response for machined metal. */
  env: number
  /** Renderer exposure multiplier. */
  exposure: number
}

/** Per-act studio lighting. Damped between acts at 5/s, never snapped. */
export const STAGE_LIGHTING: Record<ActId, StageLightState> = {
  arrival: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1 },
  settle: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1 },
  approach: { key: 2.4, fill: 0.6, rim: 1.2, env: 1, exposure: 1 },
  xray: { key: 1.4, fill: 0.9, rim: 1.4, env: 0.7, exposure: 1.05 },
  chip: { key: 1.2, fill: 1, rim: 1.6, env: 0.8, exposure: 1.15 },
  rebuild: { key: 1.8, fill: 0.8, rim: 1.3, env: 0.9, exposure: 1.05 },
  camera: { key: 2.4, fill: 0.6, rim: 1.4, env: 1, exposure: 1.05 },
  display: { key: 2, fill: 0.8, rim: 1, env: 0.9, exposure: 1 },
  storage: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1 },
  battery: { key: 1.6, fill: 0.9, rim: 1.5, env: 0.8, exposure: 1.1 },
  software: { key: 2, fill: 0.8, rim: 1, env: 0.9, exposure: 1 },
  ai: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1 },
  final: { key: 2.6, fill: 0.7, rim: 1.3, env: 1, exposure: 1.05 },
}
