import { describe, expect, it } from 'vitest'
import { TEARDOWN_LAYERS } from '../../teardown/layers.ts'
import { CARRIER_PLATES } from './carriers.tsx'

/** Carrier plates (round 03 A.5): one per shell-less layer, nothing else. */
describe('carrier plates', () => {
  it('covers exactly the internals-only layers', () => {
    // Five, not six: battery, logic-board, silicon, thermal, power-coil.
    const shellEmpty = TEARDOWN_LAYERS.filter((l) => l.shell.length === 0).map((l) => l.index)
    expect(shellEmpty).toEqual([3, 4, 5, 6, 7])
    expect(CARRIER_PLATES.map((c) => c.layer)).toEqual(shellEmpty)
    expect(new Set(CARRIER_PLATES.map((c) => c.id)).size).toBe(CARRIER_PLATES.length)
  })
})
