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

/** Cream studio (user direction): the whole film sits in a warm product-
 * photography room so the obsidian device pops. Per-act value drift keeps
 * the colour journey alive inside the cream family; display stays the
 * brightest stage, and the teardown ramp still lightens obviously across
 * its span. Text contrast is carried by the Prompt D 11 scrim, which
 * strengthens automatically as the stage brightens (tested). */
const BASE_LIGHTING: Record<ActId, StageLightState> = {
  arrival: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d3ccb9',
    stageTop: '#ece5d4',
  },
  settle: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d7d0bd',
    stageTop: '#efe8d8',
  },
  approach: {
    key: 2.4,
    fill: 0.6,
    rim: 1.2,
    env: 1,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d9d2bf',
    stageTop: '#f1ebdb',
  },
  teardown: {
    key: 1.6,
    fill: 0.9,
    rim: 1.5,
    env: 0.8,
    exposure: 1.05,
    envTint: '#eef2ff',
    stage: '#e8e2d2',
    stageTop: '#f6f1e6',
  },
  camera: {
    key: 2.4,
    fill: 0.6,
    rim: 1.4,
    env: 1,
    exposure: 1.05,
    envTint: '#d9e6ff',
    stage: '#ded8c6',
    stageTop: '#f1ebdb',
  },
  display: {
    key: 2,
    fill: 0.8,
    rim: 1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#ece6d6',
    stageTop: '#faf5ea',
  },
  storage: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d8d1be',
    stageTop: '#ece4d2',
  },
  battery: {
    key: 1.6,
    fill: 0.9,
    rim: 1.5,
    env: 0.8,
    exposure: 1.1,
    envTint: '#f2f5ff',
    stage: '#dbd4c0',
    stageTop: '#efe8d7',
  },
  software: {
    key: 2,
    fill: 0.8,
    rim: 1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d5cfbc',
    stageTop: '#e9e2d0',
  },
  ai: {
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    env: 0.9,
    exposure: 1,
    envTint: '#ffffff',
    stage: '#d2ccb9',
    stageTop: '#e6e0ce',
  },
  final: {
    key: 2.6,
    fill: 0.7,
    rim: 1.3,
    env: 1,
    exposure: 1.05,
    envTint: '#ffffff',
    stage: '#dbd4c1',
    stageTop: '#eee7d6',
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
