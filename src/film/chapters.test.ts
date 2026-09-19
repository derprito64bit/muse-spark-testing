import { describe, expect, it } from 'vitest'
import { BATTERY, CHIPSET, DISPLAY, MEMORY, PERFORMANCE, STORAGE_OPTIONS } from '../data/product.ts'
import { formatNumber } from '../lib/format.ts'
import { CHAPTERS } from './chapters.ts'
import { ACTS } from './timeline.ts'

/** The film overlay and the specifications page can never disagree. */
describe('chapter spec consistency', () => {
  it('covers every act exactly once', () => {
    const ids = CHAPTERS.map((c) => c.act).sort()
    expect(ids).toEqual(ACTS.map((a) => a.id).sort())
  })

  it('uses data values for every figure it renders', () => {
    const text = CHAPTERS.map((c) =>
      [c.kicker, c.headline, c.body, c.numeral?.value ?? '', ...(c.spec ?? [])].join(' | '),
    ).join('\n')
    const required: string[] = [
      CHIPSET.name,
      String(CHIPSET.processNm),
      String(CHIPSET.dieAreaMm2),
      formatNumber(PERFORMANCE.cpu.hero.value),
      String(PERFORMANCE.npu.hero.value),
      String(DISPLAY.refreshMax),
      formatNumber(DISPLAY.peakNits),
      formatNumber(BATTERY.capacity),
      String(BATTERY.wired),
      String(MEMORY.ramGb),
      STORAGE_OPTIONS[2]?.label ?? '1 TB',
    ]
    for (const needle of required) {
      expect(text).toContain(needle)
    }
  })
})
