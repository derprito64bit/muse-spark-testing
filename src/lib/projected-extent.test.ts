import { describe, expect, it } from 'vitest'
import { projectedExtentM, type ProjectedExtents, type V3 } from './projected-extent.ts'

const DIMS = { w: 0.0768, h: 0.1596, t: 0.0078 }

function measure(
  scale: number,
  rx: number,
  ry: number,
  rz: number,
  cam: V3,
  tgt: V3,
): ProjectedExtents {
  return projectedExtentM(DIMS, scale, rx, ry, rz, cam, tgt, { horizontalM: 0, verticalM: 0 })
}

/** Projected extents (round 03 A.6.2): correct axis for every camera. */
describe('projectedExtentM', () => {
  it('returns the box dims for an identity pose front-on', () => {
    const cam: V3 = [0, 0, 1]
    const tgt: V3 = [0, 0, 0]
    const e = measure(1, 0, 0, 0, cam, tgt)
    expect(e.horizontalM).toBeCloseTo(DIMS.w, 9)
    expect(e.verticalM).toBeCloseTo(DIMS.h, 9)
  })

  it('scales linearly with device scale', () => {
    const cam: V3 = [0, 0, 1]
    const tgt: V3 = [0, 0, 0]
    const e = measure(2, 0, 0, 0, cam, tgt)
    expect(e.horizontalM).toBeCloseTo(2 * DIMS.w, 9)
    expect(e.verticalM).toBeCloseTo(2 * DIMS.h, 9)
  })

  it('reports the full length laid flat, where the silhouette collapses', () => {
    // Teardown pose: the world-axis height reports 0.0392 (K.4 probe) for
    // a 0.2314 subject. Projection must see ~3x that, bounded by the true
    // length. (Full box corners read slightly above the long-axis-only
    // plate probe: width/thickness tilt into vertical too. That is the
    // correct input for a fit solver.)
    const cam: V3 = [0.01, 0.1259, 0.6054]
    const tgt: V3 = [0, -0.03, -0.02]
    const e = measure(1.45, -1.352, 0.185, 0.02, cam, tgt)
    expect(e.verticalM).toBeGreaterThan(0.12)
    expect(e.verticalM).toBeLessThan(1.45 * DIMS.h)
    expect(e.horizontalM).toBeGreaterThan(0)
    expect(Number.isFinite(e.horizontalM + e.verticalM)).toBe(true)
  })

  it('is invariant to camera distance (direction only)', () => {
    const tgt: V3 = [0, 0, 0]
    const near = measure(1, -0.3, 0.4, 0, [0, 0.02, 0.6], tgt)
    const far = measure(1, -0.3, 0.4, 0, [0, 0.04, 1.2], tgt)
    expect(near.horizontalM).toBeCloseTo(far.horizontalM, 6)
    expect(near.verticalM).toBeCloseTo(far.verticalM, 6)
  })
})
