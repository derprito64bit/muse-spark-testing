import { Group } from 'three'
import { describe, expect, it } from 'vitest'
import { TEARDOWN_LAYERS, featureFrame, type FeatureFrame } from './layers.ts'
import { applyLayerTransform } from './transform.ts'

const frame = (): FeatureFrame => ({ detach: 0, turn: 0, scale: 0 })

/** Shared layer transform (round 03 A.6.4): one helper, both drivers. */
describe('applyLayerTransform', () => {
  it('rests exactly at zero cursor and zero separation', () => {
    const layer = TEARDOWN_LAYERS[5]!
    for (const index of [0, 5, 9]) {
      const g = new Group()
      g.position.set(0.3, -0.2, 0.1)
      g.rotation.set(1, 2, 3)
      g.scale.setScalar(2)
      applyLayerTransform(g, TEARDOWN_LAYERS[index]!, 0, 0, 0.0085, 1, false, frame())
      expect(g.position.length()).toBeLessThan(1e-9)
      expect(g.rotation.x).toBeCloseTo(0, 12)
      expect(g.rotation.y).toBeCloseTo(0, 12)
      expect(g.rotation.z).toBeCloseTo(0, 12)
      expect(g.scale.x).toBeCloseTo(1, 9)
    }
    expect(layer.index).toBe(5)
  })

  it('honours the module slot override for nested groups', () => {
    const g = new Group()
    // Detached hold plateau (lp in the hold window), full damp: lands on
    // the overridden slot, not the layer's own. Cover glass pivots at the
    // origin, so the pivot compensation is exactly zero here.
    applyLayerTransform(g, TEARDOWN_LAYERS[0]!, 0.66, 1, 0.0085, 1, false, frame(), 0.0123)
    expect(g.position.z).toBeCloseTo(0.0123 + 0.014, 9)
  })

  it('counter-translates scaled heroes about their pivot', () => {
    // Silicon pivots at its package, not the phone origin: with a live
    // scale bump the goal shifts slightly toward the pivot versus a
    // pivot-less layer, and matches exactly when the bump is zero.
    const silicon = TEARDOWN_LAYERS[5]!
    const flat = { ...silicon, heroPivot: [0, 0] as const }
    const a = new Group()
    const b = new Group()
    applyLayerTransform(a, silicon, 5.66, 1, 0.0085, 1, false, frame())
    applyLayerTransform(b, flat, 5.66, 1, 0.0085, 1, false, frame())
    const dz = a.position.z - b.position.z
    expect(Math.abs(dz)).toBeGreaterThan(0)
    expect(Math.abs(dz)).toBeLessThan(0.002)
    expect(dz).toBeLessThan(0)
  })

  it('is deterministic and reversible from the same inputs', () => {
    const a = new Group()
    const b = new Group()
    const layer = TEARDOWN_LAYERS[3]!
    applyLayerTransform(a, layer, 3.4, 0.7, 0.0085, 0.5, false, frame())
    applyLayerTransform(b, layer, 3.4, 0.7, 0.0085, 0.5, false, frame())
    expect(a.position.equals(b.position)).toBe(true)
    expect(a.scale.equals(b.scale)).toBe(true)
    // Reduced-motion path writes the same goal shape without tumbling.
    const c = new Group()
    applyLayerTransform(c, layer, 3.4, 0.7, 0.0085, 1, true, frame())
    expect(c.rotation.x).toBe(0)
    expect(c.position.x).toBeGreaterThan(0)
  })

  it('snaps past 10mm instead of lag-flinging on flicks (overnight fix)', () => {
    const layer = TEARDOWN_LAYERS[5]!
    // Far from goal with weak damp: lands exactly, no lag pile-up.
    const far = new Group()
    far.position.set(0.5, -0.3, 0.2)
    applyLayerTransform(far, layer, 5.5, 1, 0.0085, 0.05, false, frame())
    const f = frame()
    featureFrame(0.5, layer.weight, f, false)
    const off = (5 - 4.5) * 0.0085 * 1
    expect(far.position.x).toBeCloseTo(0.07 * f.detach, 12)
    expect(far.position.z).toBeCloseTo(off + 0.014 * f.detach, 12)
    // Near goal with weak damp: still glides (no snap, no pop).
    const near = new Group()
    near.position.set(0.069, 0.0079, off + 0.0139)
    applyLayerTransform(near, layer, 5.5, 1, 0.0085, 0.05, false, frame())
    expect(near.position.x).toBeGreaterThan(0.069)
    expect(near.position.x).toBeLessThan(0.07 * f.detach + 1e-9)
  })
})
