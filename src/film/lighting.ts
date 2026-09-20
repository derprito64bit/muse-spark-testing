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
  /** Environment tint: the camera act pushes cooler so coatings read. */
  envTint: string
}

/** Per-act studio lighting. Damped between acts at 5/s, never snapped. */
export const STAGE_LIGHTING: Record<ActId, StageLightState> = {
  arrival: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  settle: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  approach: { key: 2.4, fill: 0.6, rim: 1.2, env: 1, exposure: 1, envTint: '#ffffff' },
  xray: { key: 1.4, fill: 0.9, rim: 1.4, env: 0.7, exposure: 1.05, envTint: '#f2f5ff' },
  chip: { key: 1.2, fill: 1, rim: 1.6, env: 0.8, exposure: 1.15, envTint: '#f2f5ff' },
  rebuild: { key: 1.8, fill: 0.8, rim: 1.3, env: 0.9, exposure: 1.05, envTint: '#ffffff' },
  camera: { key: 2.4, fill: 0.6, rim: 1.4, env: 1, exposure: 1.05, envTint: '#d9e6ff' },
  display: { key: 2, fill: 0.8, rim: 1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  storage: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  battery: { key: 1.6, fill: 0.9, rim: 1.5, env: 0.8, exposure: 1.1, envTint: '#f2f5ff' },
  software: { key: 2, fill: 0.8, rim: 1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  ai: { key: 2.2, fill: 0.7, rim: 1.1, env: 0.9, exposure: 1, envTint: '#ffffff' },
  final: { key: 2.6, fill: 0.7, rim: 1.3, env: 1, exposure: 1.05, envTint: '#ffffff' },
}
