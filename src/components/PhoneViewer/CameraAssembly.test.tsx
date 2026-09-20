import { describe, expect, it } from 'vitest'
import { islandUpperCenter, lensSpecs } from './CameraAssembly.tsx'
import {
  ISLAND,
  ISLAND_FLASH,
  ISLAND_LOWER,
  ISLAND_RANGE,
  ISLAND_UPPER,
  LENS_LAYOUT,
  THREAD_RING,
} from './phoneDimensions.ts'

const UPPER_HALF = ISLAND_UPPER.size / 2
const LOWER_HALF = ISLAND_LOWER.size / 2

describe('plateau camera layout', () => {
  it('seats every lens plus collar inside the upper shelf', () => {
    const center = islandUpperCenter()
    for (const spec of lensSpecs()) {
      const dist = Math.hypot(spec.x - center.x, spec.y - center.y)
      expect(dist + spec.r + 0.0012).toBeLessThanOrEqual(UPPER_HALF)
    }
    expect(lensSpecs()).toHaveLength(LENS_LAYOUT.length)
  })

  it('parks flash and rangefinder on the lower shelf clear of the upper disc', () => {
    const center = islandUpperCenter()
    const lower = { x: ISLAND.x, y: ISLAND.y }
    for (const mod of [ISLAND_FLASH, ISLAND_RANGE]) {
      const x = lower.x + Math.cos(mod.angle) * mod.ring
      const y = lower.y + Math.sin(mod.angle) * mod.ring
      // On the lower pad…
      expect(Math.abs(x - lower.x)).toBeLessThanOrEqual(LOWER_HALF)
      expect(Math.abs(y - lower.y)).toBeLessThanOrEqual(LOWER_HALF)
      // …and clear of the upper disc.
      expect(Math.hypot(x - center.x, y - center.y)).toBeGreaterThan(UPPER_HALF)
    }
  })

  it('rings the thread around the pad perimeter', () => {
    expect(THREAD_RING.teeth).toBe(96)
    expect(THREAD_RING.outer).toBeLessThanOrEqual(LOWER_HALF)
    expect(THREAD_RING.inner).toBeGreaterThan(UPPER_HALF)
  })

  it('tunes each lens coating differently', () => {
    const hues = lensSpecs().map((s) => s.coatHue)
    expect(new Set(hues).size).toBe(hues.length)
  })
})
