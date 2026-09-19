import { describe, expect, it } from 'vitest'
import { filmKeys, sampleFilm } from './sample.ts'

describe('timeline sampler', () => {
  it('lands every authored key at its authored progress', () => {
    for (const k of filmKeys()) {
      const s = sampleFilm(k.at)
      expect(s.pos.x).toBeCloseTo(k.camera.pos[0], 3)
      expect(s.pos.y).toBeCloseTo(k.camera.pos[1], 3)
      expect(s.pos.z).toBeCloseTo(k.camera.pos[2], 3)
      expect(s.target.x).toBeCloseTo(k.camera.target[0], 3)
      expect(s.target.y).toBeCloseTo(k.camera.target[1], 3)
      expect(s.target.z).toBeCloseTo(k.camera.target[2], 3)
      expect(s.rx).toBeCloseTo(k.pose.rx, 6)
      expect(s.ry).toBeCloseTo(k.pose.ry, 6)
      expect(s.fov).toBeCloseTo(k.lens.fov, 6)
    }
  })

  it('reuses one scratch object across samples (zero allocation)', () => {
    const first = sampleFilm(0.42)
    for (let i = 0; i < 10000; i++) {
      const s = sampleFilm((i % 1000) / 1000)
      expect(s).toBe(first)
    }
  })

  it('stays continuous under fine sampling (no camera slam)', () => {
    // Segment-aware: no single frame may cover more than a fraction of its
    // own segment travel. Fast authored whips (macro exits) pass because
    // their chord is long; a true discontinuity has no chord and fails.
    const keys = filmKeys()
    for (let s = 0; s < keys.length - 1; s++) {
      const a = keys[s]
      const b = keys[s + 1]
      if (a === undefined || b === undefined) continue
      const span = b.at - a.at
      const sub = 40
      // Snapshot immediately: sampleFilm reuses one scratch object.
      const sa = sampleFilm(a.at)
      const startPos = sa.pos.clone()
      const startTgt = sa.target.clone()
      const startFov = sa.fov
      const sb = sampleFilm(b.at)
      const posChord = startPos.distanceTo(sb.pos)
      const tgtChord = startTgt.distanceTo(sb.target)
      const fovChord = Math.abs(sb.fov - startFov)
      let prevPos = startPos.clone()
      let prevTgt = startTgt.clone()
      let prevFov = startFov
      for (let i = 1; i <= sub; i++) {
        const p = sampleFilm(a.at + (span * i) / sub)
        expect(p.pos.distanceTo(prevPos)).toBeLessThan(Math.max(0.02, posChord * 0.3))
        expect(p.target.distanceTo(prevTgt)).toBeLessThan(Math.max(0.02, tgtChord * 0.3))
        expect(Math.abs(p.fov - prevFov)).toBeLessThan(Math.max(0.5, fovChord * 0.3))
        prevPos = p.pos.clone()
        prevTgt = p.target.clone()
        prevFov = p.fov
      }
    }
  })

  it('respects FOV clamps across the range', () => {
    for (let i = 0; i <= 200; i++) {
      const s = sampleFilm(i / 200)
      expect(s.fov).toBeGreaterThanOrEqual(10)
      expect(s.fov).toBeLessThanOrEqual(52)
      expect(s.fovMax).toBeGreaterThan(0)
      expect(s.fovMax).toBeLessThanOrEqual(60)
    }
  })
})
