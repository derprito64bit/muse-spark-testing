import { describe, expect, it } from 'vitest'
import { computeFilmStates, ramplike } from './states.ts'

describe('film states', () => {
  it('opens no x-ray window at rest', () => {
    const s = computeFilmStates(0)
    expect(s.shellGhost).toBe(0)
    expect(s.internalOpacity).toBe(0)
    expect(s.explodeXray).toBe(0)
    expect(s.chipFocus).toBe(0)
  })

  it('fully ghosts the shell and shows internals mid x-ray', () => {
    const s = computeFilmStates(0.33)
    expect(s.shellGhost).toBeGreaterThan(0.9)
    expect(s.internalOpacity).toBeGreaterThan(0.9)
    expect(s.explodeXray).toBeGreaterThan(0.5)
  })

  it('restores the shell before the camera act', () => {
    for (const p of [0.52, 0.6, 0.8, 1]) {
      const s = computeFilmStates(p)
      if (p === 1) continue
      expect(s.shellGhost).toBe(0)
    }
    const end = computeFilmStates(1)
    expect(end.internalOpacity).toBe(0)
    expect(end.explodeXray).toBe(0)
  })

  it('focuses the die through the chip act, then releases', () => {
    expect(computeFilmStates(0.445).chipFocus).toBeCloseTo(1, 4)
    expect(computeFilmStates(0.53).chipFocus).toBe(0)
  })

  it('ramps plateaus up, holds, and descends', () => {
    expect(ramplike(0, 0.2, 0.3, 0.7, 0.8)).toBe(0)
    expect(ramplike(0.5, 0.2, 0.3, 0.7, 0.8)).toBe(1)
    expect(ramplike(1, 0.2, 0.3, 0.7, 0.8)).toBe(0)
    const mid = ramplike(0.25, 0.2, 0.3, 0.7, 0.8)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
  })
})
