import { describe, expect, it } from 'vitest'
import {
  BATTERY,
  CAMERA_LENSES,
  CHIPSET,
  DEFAULT_STORAGE_GB,
  DIMENSIONS,
  DISPLAY,
  FINISHES,
  FOCAL_LENGTHS,
  MEMORY,
  PERFORMANCE,
  SPEC_CATEGORIES,
  STORAGE_OPTIONS,
} from './product.ts'

/** The film overlay and the specifications page must never disagree. */
describe('product data consistency', () => {
  it('has unique finish, lens, focal, and storage entries', () => {
    expect(new Set(FINISHES.map((f) => f.id)).size).toBe(FINISHES.length)
    expect(new Set(CAMERA_LENSES.map((l) => l.id)).size).toBe(CAMERA_LENSES.length)
    expect(new Set(FOCAL_LENGTHS.map((f) => f.zoom)).size).toBe(FOCAL_LENGTHS.length)
    expect(new Set(STORAGE_OPTIONS.map((s) => s.gb)).size).toBe(STORAGE_OPTIONS.length)
  })

  it('keeps the default storage inside the offered tiers', () => {
    expect(STORAGE_OPTIONS.some((s) => s.gb === DEFAULT_STORAGE_GB)).toBe(true)
  })

  it('keeps chipset facts aligned with the performance units', () => {
    expect(CHIPSET.npuTops).toBe(PERFORMANCE.npu.hero.value)
    expect(CHIPSET.cpuCores).toBe(8)
    expect(CHIPSET.gpuCores).toBe(14)
  })

  it('keeps every SoC metric inside its declared max', () => {
    for (const unit of Object.values(PERFORMANCE)) {
      for (const metric of unit.metrics) {
        expect(metric.value).toBeLessThanOrEqual(metric.max)
      }
    }
  })

  it('keeps battery presets and drain keys in sync', () => {
    const keys = Object.keys(BATTERY.drainPerHour).sort()
    for (const preset of Object.values(BATTERY.presets)) {
      expect(Object.keys(preset).sort()).toEqual(keys)
    }
  })

  it('mentions every key spec value somewhere in the spec tables', () => {
    const haystack = SPEC_CATEGORIES.flatMap((c) => c.rows.map((r) => r.value)).join(' | ')
    const required = [
      String(DISPLAY.peakNits),
      String(DISPLAY.refreshMax),
      String(BATTERY.capacity),
      String(DIMENSIONS.weightG),
      String(MEMORY.ramGb),
      String(CHIPSET.dieAreaMm2),
    ]
    for (const needle of required) {
      expect(haystack).toContain(needle)
    }
    expect(SPEC_CATEGORIES.length).toBeGreaterThan(10)
    for (const category of SPEC_CATEGORIES) {
      expect(category.rows.length).toBeGreaterThan(0)
    }
  })
})
