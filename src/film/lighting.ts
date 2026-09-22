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
export const STAGE_LIGHTING: Record<ActId, StageLightState> = {
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
    stage: '#2f3648',
    stageTop: '#414c60',
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
