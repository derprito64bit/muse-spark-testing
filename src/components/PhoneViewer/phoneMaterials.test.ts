import { describe, expect, it } from 'vitest'
import {
  FINISH_PARAMS,
  MATERIAL_KEYS,
  createPhoneMaterials,
  disposePhoneMaterials,
} from './phoneMaterials.ts'

describe('phone material sets', () => {
  it('creates every material in the registry', () => {
    const set = createPhoneMaterials(FINISH_PARAMS.obsidian)
    for (const key of MATERIAL_KEYS) {
      expect(set[key]).toBeDefined()
    }
    expect(Object.keys(set)).toHaveLength(MATERIAL_KEYS.length)
    disposePhoneMaterials(set)
  })

  it('mints independent instances per call (film x-ray isolation)', () => {
    const a = createPhoneMaterials(FINISH_PARAMS.obsidian)
    const b = createPhoneMaterials(FINISH_PARAMS.obsidian)
    expect(a.frame.uuid).not.toBe(b.frame.uuid)
    a.frame.opacity = 0.1
    expect(b.frame.opacity).toBe(1)
    disposePhoneMaterials(a)
    disposePhoneMaterials(b)
  })

  it('disposes without throwing (unmount cleanliness)', () => {
    const set = createPhoneMaterials(FINISH_PARAMS.titanium)
    expect(() => disposePhoneMaterials(set)).not.toThrow()
  })
})
