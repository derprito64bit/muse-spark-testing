import { describe, expect, it } from 'vitest'
import { EXPLODE_PARTS } from '../internals/explode.ts'
import {
  LAYER_GAP,
  TEARDOWN_LAYERS,
  cursorAt,
  featureFrame,
  layerOffset,
  layerProgress,
  weightDamp,
  type FeatureFrame,
} from './layers.ts'

/** Teardown manifest (Prompt D section 4): ten layers, honest stack order. */
describe('teardown layers', () => {
  it('lists ten layers front to back with silicon at the midpoint', () => {
    expect(TEARDOWN_LAYERS).toHaveLength(10)
    expect(TEARDOWN_LAYERS.map((l) => l.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(TEARDOWN_LAYERS[5]?.id).toBe('silicon')
    expect(TEARDOWN_LAYERS[0]?.id).toBe('cover-glass')
    expect(TEARDOWN_LAYERS[9]?.id).toBe('rear-panel')
  })

  it('covers every explode registry part exactly once', () => {
    const covered = new Set<string>()
    for (const layer of TEARDOWN_LAYERS) {
      for (const part of layer.parts) {
        expect(covered.has(part), `duplicate ${part}`).toBe(false)
        covered.add(part)
      }
    }
    // Registry ids not carried by a layer would never move in teardown.
    const uncovered = EXPLODE_PARTS.map((p) => p.id).filter((id) => !covered.has(id))
    expect(uncovered).toEqual([])
  })

  it('separates symmetrically about the body centre', () => {
    expect(layerOffset(0, 10, LAYER_GAP, 1)).toBeCloseTo(-4.5 * LAYER_GAP, 9)
    expect(layerOffset(9, 10, LAYER_GAP, 1)).toBeCloseTo(4.5 * LAYER_GAP, 9)
    expect(layerOffset(0, 10, LAYER_GAP, 1) + layerOffset(9, 10, LAYER_GAP, 1)).toBeCloseTo(0, 9)
    expect(layerOffset(4, 10, LAYER_GAP, 0)).toBeCloseTo(0, 12)
  })

  it('maps master progress to per-layer local progress', () => {
    // Ten windows of 0.020 across 0.295 to 0.495.
    expect(layerProgress(0.29, 0, 10, 0.295, 0.495)).toBe(0)
    expect(layerProgress(0.305, 0, 10, 0.295, 0.495)).toBeCloseTo(0.5, 2)
    expect(layerProgress(0.315, 0, 10, 0.295, 0.495)).toBe(1)
    expect(layerProgress(0.315, 1, 10, 0.295, 0.495)).toBe(0)
    expect(layerProgress(0.5, 9, 10, 0.295, 0.495)).toBe(1)
    expect(layerProgress(0.6, 9, 10, 0.295, 0.495)).toBe(1)
  })

  it('moves heavy layers slower than light ones', () => {
    expect(weightDamp('heavy')).toBeLessThan(weightDamp('medium'))
    expect(weightDamp('medium')).toBeLessThan(weightDamp('light'))
  })

  it('sizes every featured subject for the macro floor (round 01 A4)', () => {
    for (const layer of TEARDOWN_LAYERS) {
      expect(layer.featureHalfM, layer.id).toBeGreaterThan(0)
      expect(layer.featureHalfM, layer.id).toBeLessThanOrEqual(0.08)
    }
    const byId = (id: string): number => TEARDOWN_LAYERS.find((l) => l.id === id)?.featureHalfM ?? 0
    // Silicon keeps the old die-sized floor; the board sets the widest.
    expect(byId('silicon')).toBe(0.0125)
    expect(byId('logic-board')).toBeGreaterThan(byId('silicon'))
    expect(byId('cover-glass')).toBe(0.08)
  })

  it('runs the cursor 0 to 10 across the feature run', () => {
    expect(cursorAt(0.29)).toBe(0)
    expect(cursorAt(0.305)).toBeCloseTo(0.5, 2)
    expect(cursorAt(0.495)).toBe(10)
    expect(cursorAt(0.6)).toBe(10)
  })

  it('plays detach, flip, hold, and restack without allocating', () => {
    const frame: FeatureFrame = { detach: 0, turn: 0, scale: 0 }
    featureFrame(0, 'medium', frame)
    expect(frame.detach).toBe(0)
    expect(frame.turn).toBe(0)
    featureFrame(0.11, 'medium', frame)
    expect(frame.detach).toBeGreaterThan(0.3)
    featureFrame(0.05, 'medium', frame)
    expect(frame.turn).toBe(0)
    featureFrame(0.4, 'medium', frame)
    expect(frame.turn).toBeGreaterThan(0.3)
    featureFrame(0.75, 'medium', frame)
    expect(frame.detach).toBeCloseTo(1, 2)
    expect(frame.turn).toBeCloseTo(1, 2)
    expect(frame.scale).toBeGreaterThan(0.5)
    featureFrame(1, 'medium', frame)
    expect(frame.detach).toBe(0)
    expect(frame.turn).toBe(0)
    expect(frame.scale).toBe(0)
  })

  it('cross-fades envelopes linearly under reduced motion (round 01 A7)', () => {
    // No tumble, no overshoot, and no binary teleport: every channel moves
    // continuously with local progress so scrubbing stays exact.
    const frame: FeatureFrame = { detach: 0, turn: 0, scale: 0 }
    featureFrame(0.4, 'light', frame, true)
    expect(frame.detach).toBeCloseTo(1, 2)
    expect(frame.turn).toBe(0)
    featureFrame(0.59, 'medium', frame, true)
    expect(frame.scale).toBeGreaterThan(0.4)
    expect(frame.scale).toBeLessThan(0.6)
    featureFrame(0.9, 'medium', frame, true)
    expect(frame.detach).toBeGreaterThan(0)
    expect(frame.detach).toBeLessThan(1)
    expect(frame.turn).toBe(0)
    featureFrame(0.01, 'medium', frame, true)
    expect(frame.detach).toBe(0)
    featureFrame(0.99, 'medium', frame, true)
    expect(frame.detach).toBe(0)
    // Continuity: fine sampling never jumps.
    let prev = -1
    for (let i = 0; i <= 100; i++) {
      featureFrame(i / 100, 'light', frame, true)
      if (prev >= 0) {
        expect(Math.abs(frame.detach - prev)).toBeLessThan(0.1)
      }
      prev = frame.detach
    }
  })

  it('keeps every accent distinct', () => {
    const accents = TEARDOWN_LAYERS.map((l) => l.accent)
    expect(new Set(accents).size).toBe(accents.length)
  })
})
