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
  /** Cyclorama base: the stage carries the colour, the product stays neutral. */
  stage: string
  /** Cyclorama crown: horizon glow tint. */
  stageTop: string
}

/** Per-act studio lighting. Damped between acts at 5/s, never snapped. */
const BASE_LIGHTING: Record<ActId, StageLightState> = {
  arrival: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#161a24',
    stageTop: '#232b3d',
  },
  settle: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#1a1f2b',
    stageTop: '#283045',
  },
  approach: {
    key: 2.4,
    fill: 0.6,
    rim: 1.2,
    env: 1,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#1e2432',
    stageTop: '#2e3a50',
  },
  teardown: {
    key: 1.6,
    fill: 0.9,
    rim: 1.5,
    env: 0.8,
    exposure: 1.05,
    envTint: '#eef2ff',
    stage: '#3a4252',
    stageTop: '#4a5468',
  },
  camera: {
    key: 2.4,
    fill: 0.6,
    rim: 1.4,
    env: 1,
    exposure: 1.05,
    envTint: '#d9e6ff',
    stage: '#22303a',
    stageTop: '#31485a',
  },
  display: {
    key: 2,
    fill: 0.8,
    rim: 1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#4a5266',
    stageTop: '#5d6880',
  },
  storage: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#2e2a3e',
    stageTop: '#453f5c',
  },
  battery: {
    key: 1.6,
    fill: 0.9,
    rim: 1.5,
    env: 0.8,
    exposure: 1.1,
    envTint: '#f2f5ff',
    stage: '#33301f',
    stageTop: '#4d4830',
  },
  software: {
    key: 2,
    fill: 0.8,
    rim: 1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#2a2d3e',
    stageTop: '#3f4360',
  },
  ai: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#1f2a42',
    stageTop: '#2f4066',
  },
  final: {
    key: 2.6,
    fill: 0.7,
    rim: 1.3,
    env: 1,
    exposure: 1.05,
    envTint: '#ffffff',
    stage: '#3e4456',
    stageTop: '#565e78',
  },
}

/**
 * Overnight detail-review boost: brighter key/fill/rim/env plus a touch
 * more exposure so small hardware reads at a glance. Ratios and mood
 * carry over — every act scales by the same factors. Stage colors and
 * env tints pass through untouched (colour journey tests pin them).
 */
function brighten(state: StageLightState): StageLightState {
  const r2 = (v: number): number => Math.round(v * 100) / 100
  return {
    ...state,
    key: r2(state.key * 1.35),
    fill: r2(state.fill * 1.6),
    rim: r2(state.rim * 1.3),
    env: r2(state.env * 1.15),
    exposure: r2(Math.min(1.15, state.exposure + 0.08)),
  }
}

export const STAGE_LIGHTING: Record<ActId, StageLightState> = Object.fromEntries(
  (Object.entries(BASE_LIGHTING) as Array<[ActId, StageLightState]>).map(([id, s]) => [
    id,
    brighten(s),
  ]),
) as Record<ActId, StageLightState>
