import { Group } from 'three'
import { describe, expect, it } from 'vitest'
import { LAYER_GAP, TEARDOWN_LAYERS, layerOffset, peelLocal } from './layers.ts'
import { applyLayerTransform } from './transform.ts'

/** Shared layer transform (round 03 A.6.4): one helper, both drivers. */
describe('applyLayerTransform', () => {
  it('rests exactly at zero separation', () => {
    for (const index of [0, 5, 9]) {
      const g = new Group()
      g.position.set(0.3, -0.2, 0.1)
      g.rotation.set(1, 2, 3)
      g.scale.setScalar(2)
      applyLayerTransform(g, TEARDOWN_LAYERS[index]!, 0, LAYER_GAP, 1)
      expect(g.position.length()).toBeLessThan(1e-9)
      expect(g.rotation.x).toBe(0)
      expect(g.rotation.y).toBe(0)
      expect(g.rotation.z).toBe(0)
      expect(g.scale.x).toBe(1)
    }
  })

  it('lands on the peel slot at full separation', () => {
    for (let i = 0; i < 10; i++) {
      const g = new Group()
      applyLayerTransform(g, TEARDOWN_LAYERS[i]!, 1, LAYER_GAP, 1)
      expect(g.position.x).toBe(0)
      if (i !== 8) expect(g.position.y).toBe(0)
      expect(g.position.z).toBeCloseTo(layerOffset(i, 10, LAYER_GAP, 1), 12)
    }
  })

  it('honours the module slot override for nested groups', () => {
    const g = new Group()
    applyLayerTransform(g, TEARDOWN_LAYERS[8]!, 1, LAYER_GAP, 1, 0.0123)
    expect(g.position.z).toBeCloseTo(0.0123, 12)
  })

  it('keeps every layer unrotated except the parking camera module', () => {
    for (let i = 0; i < 10; i++) {
      if (i === 8) continue
      const g = new Group()
      applyLayerTransform(g, TEARDOWN_LAYERS[i]!, 0.63, LAYER_GAP, 1)
      expect(g.rotation.x).toBe(0)
      expect(g.rotation.y).toBe(0)
      expect(g.rotation.z).toBe(0)
      expect(g.scale.x).toBe(1)
    }
  })

  it('parks the camera module lens-up at full separation', () => {
    // Turn is the layer's own peel: parked by sep 1, exact at sep 0.
    const g = new Group()
    applyLayerTransform(g, TEARDOWN_LAYERS[8]!, 1, LAYER_GAP, 1)
    expect(g.rotation.x).toBeCloseTo(Math.PI, 12)
    // Stays on its slot upside-down: pivot held, slot carried.
    expect(g.position.x).toBeCloseTo(0, 12)
    expect(g.position.y).toBeCloseTo(2 * 0.0458, 12)
    expect(g.position.z).toBeCloseTo(layerOffset(8, 10, LAYER_GAP, 1), 12)
    const rest = new Group()
    applyLayerTransform(rest, TEARDOWN_LAYERS[8]!, 0, LAYER_GAP, 1)
    expect(rest.rotation.x).toBe(0)
    expect(rest.position.length()).toBeLessThan(1e-9)
  })

  it('peels glass first: front layers travel further mid-separation', () => {
    const a = new Group()
    const b = new Group()
    applyLayerTransform(a, TEARDOWN_LAYERS[0]!, 0.3, LAYER_GAP, 1)
    applyLayerTransform(b, TEARDOWN_LAYERS[9]!, 0.3, LAYER_GAP, 1)
    expect(Math.abs(a.position.z)).toBeGreaterThan(0)
    expect(b.position.z).toBe(0)
    expect(Math.abs(a.position.z)).toBeCloseTo(
      Math.abs(layerOffset(0, 10, LAYER_GAP, peelLocal(0.3, 0))),
      12,
    )
  })

  it('is deterministic and reversible from the same inputs', () => {
    const layer = TEARDOWN_LAYERS[3]!
    const a = new Group()
    const b = new Group()
    applyLayerTransform(a, layer, 0.7, LAYER_GAP, 0.5)
    applyLayerTransform(b, layer, 0.7, LAYER_GAP, 0.5)
    expect(a.position.equals(b.position)).toBe(true)
    expect(a.scale.equals(b.scale)).toBe(true)
  })

  it('snaps past 10mm instead of lag-flinging on flicks (overnight fix)', () => {
    const layer = TEARDOWN_LAYERS[5]!
    // Far from goal with weak damp: lands exactly, no lag pile-up.
    const far = new Group()
    far.position.set(0.5, -0.3, 0.2)
    applyLayerTransform(far, layer, 1, LAYER_GAP, 0.05)
    expect(far.position.z).toBeCloseTo(layerOffset(5, 10, LAYER_GAP, 1), 12)
    // Near goal with weak damp: still glides (no snap, no pop).
    const goal = layerOffset(5, 10, LAYER_GAP, 1)
    const near = new Group()
    near.position.set(0, 0, goal - 0.005)
    applyLayerTransform(near, layer, 1, LAYER_GAP, 0.05)
    expect(near.position.z).toBeGreaterThan(goal - 0.005)
    expect(near.position.z).toBeLessThan(goal)
  })
})
