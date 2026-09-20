import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  ASSEMBLY_CENTROID,
  EXPLODE_DIRECTIONS,
  EXPLODE_PARTS,
  explodeVector,
  partProgress,
} from './explode.ts'

describe('explode registry', () => {
  it('derives unit directions with the rear stack pointing rearward', () => {
    for (const part of EXPLODE_PARTS) {
      const dir = EXPLODE_DIRECTIONS[part.id]
      expect(dir, part.id).toBeDefined()
      if (dir !== undefined) expect(dir.length()).toBeCloseTo(1, 6)
    }
    const optics = EXPLODE_DIRECTIONS['lens-main']
    expect(optics?.z).toBeLessThan(0)
    const glass = EXPLODE_DIRECTIONS['front-glass']
    expect(glass?.z).toBeGreaterThan(0)
  })

  it('fans outward from the centroid, never authoring a direction', () => {
    const out = new THREE.Vector3()
    explodeVector([0.05, 0.01, 0], ASSEMBLY_CENTROID, 0.45, out)
    expect(out.x).toBeGreaterThan(0.3)
    explodeVector([-0.05, 0.01, -0.004], ASSEMBLY_CENTROID, 0.45, out)
    expect(out.x).toBeLessThan(-0.3)
    expect(out.z).toBeLessThan(0)
  })

  it('normalises delays into [0, 0.45] with the outer parts first', () => {
    let maxDelay = 0
    for (const part of EXPLODE_PARTS) {
      expect(part.delay).toBeGreaterThanOrEqual(0)
      expect(part.delay).toBeLessThanOrEqual(0.45)
      maxDelay = Math.max(maxDelay, part.delay)
    }
    expect(maxDelay).toBeCloseTo(0.45, 6)
  })

  it(' staggers parts as a wave through partProgress', () => {
    expect(partProgress(0, 0.2)).toBe(0)
    expect(partProgress(1, 0.2)).toBe(1)
    // Same master value, different delays: the wave, not a pop.
    expect(partProgress(0.5, 0)).toBeGreaterThan(partProgress(0.5, 0.4))
    expect(partProgress(0.4, 0.45)).toBe(0)
  })

  it('registers the full Prompt B part list', () => {
    const ids = EXPLODE_PARTS.map((p) => p.id)
    for (const id of [
      'midframe',
      'rear-panel',
      'front-glass',
      'pcb',
      'shield-lid',
      'shield-fence',
      'substrate',
      'die',
      'bga-array',
      'thermal-plate',
      'graphite-sheet',
      'cell',
      'cell-wrap',
      'charge-coil',
      'lens-main',
      'lens-ultra',
      'lens-tele',
      'sensor-stack',
    ]) {
      expect(ids).toContain(id)
    }
  })
})
