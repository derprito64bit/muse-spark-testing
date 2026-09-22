import { describe, expect, it } from 'vitest'
import { stageColors } from './stageColors.ts'

/** Stage colour journey (Prompt D section 8.2): continuous and reversible. */
describe('stageColors', () => {
  it('starts at the arrival base and ends at the final base', () => {
    const start = stageColors(0).base.getHexString()
    const end = stageColors(1).base.getHexString()
    expect(start).toBe('161a24')
    expect(end).toBe('3e4456')
  })

  it('makes the display act the brightest stage in the film', () => {
    const luminance = (hex: string): number => {
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const display = luminance(stageColors(0.78).base.getHexString())
    for (const p of [0, 0.1, 0.3, 0.45, 0.6, 0.9, 1]) {
      expect(display).toBeGreaterThan(luminance(stageColors(p).base.getHexString()))
    }
  })

  it('reverses exactly for the reverse scrub', () => {
    for (const p of [0, 0.13, 0.27, 0.4, 0.55, 0.72, 0.86, 0.99, 1]) {
      const a = stageColors(p).base.getHexString()
      const b = stageColors(p).base.getHexString()
      expect(a).toBe(b)
      expect(stageColors(p).top.getHexString()).toBe(stageColors(p).top.getHexString())
    }
  })
})
