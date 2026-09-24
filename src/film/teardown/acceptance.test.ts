import { describe, expect, it } from 'vitest'
import { DIM } from '../../components/PhoneViewer/phoneDimensions.ts'
import { fitFov } from '../framing.ts'
import { projectedExtentM } from '../../lib/projected-extent.ts'
import { sampleFilm } from '../sample.ts'
import { computeFilmStates } from '../states.ts'
import { LAYER_GAP, featureFrame, layerOffset } from './layers.ts'
import { stackProjection } from './transform.ts'
import type { FeatureFrame } from './layers.ts'

/** Part A acceptance, automated (round 03 A.7): pure math, no renderer. */
describe('teardown acceptance', () => {
  const sample = (p: number): ReturnType<typeof stackProjection> => {
    const t = sampleFilm(p)
    return stackProjection(
      t.rx,
      t.ry,
      t.scale,
      [t.pos.x, t.pos.y, t.pos.z],
      [t.target.x, t.target.y, t.target.z],
    )
  }

  it('holds the camera at 12-18 degrees across the feature run', () => {
    for (let p = 0.28; p <= 0.4901; p += 0.005) {
      const s = sample(p)
      expect(s.elevationDeg, `p=${p.toFixed(3)}`).toBeGreaterThanOrEqual(12)
      expect(s.elevationDeg, `p=${p.toFixed(3)}`).toBeLessThanOrEqual(18)
    }
  })

  it('wastes under half the stack axis into view depth', () => {
    for (let p = 0.28; p <= 0.4901; p += 0.005) {
      expect(sample(p).intoDepth, `p=${p.toFixed(3)}`).toBeLessThan(0.5)
    }
  })

  it('keeps over 85% of the stack axis on screen-vertical', () => {
    for (let p = 0.28; p <= 0.4901; p += 0.005) {
      expect(sample(p).onScreenUp, `p=${p.toFixed(3)}`).toBeGreaterThan(0.85)
    }
  })

  it('stacks taller than two-thirds of a plate', () => {
    // Band measured 0.648-0.69: the floor is gap arithmetic, the wobble is
    // Catmull-Rom breathing between keys. 0.64 keeps the wobble green while
    // a true collapse (shipped: 0.24) fails by a mile.
    for (let p = 0.28; p <= 0.4901; p += 0.005) {
      expect(sample(p).ratio, `p=${p.toFixed(3)}`).toBeGreaterThan(0.64)
    }
  })

  it('fits the separated stack within the frame on 0.5, 1.0 and 2.0 aspects', () => {
    for (const aspect of [0.5, 1.0, 2.0]) {
      for (let p = 0.28; p <= 0.4901; p += 0.01) {
        const t = sampleFilm(p)
        if (t.fit === null) continue
        const states = computeFilmStates(p)
        const dist = Math.hypot(t.pos.x - t.target.x, t.pos.y - t.target.y, t.pos.z - t.target.z)
        const ext = { horizontalM: 0, verticalM: 0 }
        projectedExtentM(
          { w: DIM.w, h: DIM.h, t: DIM.t + 9 * LAYER_GAP * states.stackSeparate },
          t.scale,
          t.rx,
          t.ry,
          t.rz,
          [t.pos.x, t.pos.y, t.pos.z],
          [t.target.x, t.target.y, t.target.z],
          ext,
        )
        const fit = fitFov({
          fit: t.fit,
          distanceM: dist,
          aspect,
          scale: t.scale,
          rxRad: t.rx,
          ryRad: t.ry,
          pxM: t.px,
          maxFovDeg: t.fovMax,
          extents: ext,
        })
        const final = Math.min(t.fovMax, t.fov + (fit - t.fov) * Math.min(1, Math.max(0, t.fit)))
        const needStack = (2 * Math.atan(ext.verticalM / (2 * dist)) * 180) / Math.PI
        expect(needStack / final, `aspect=${aspect} p=${p.toFixed(3)}`).toBeLessThanOrEqual(1)
      }
    }
  })

  it('parks every layer group exactly at zero separation', () => {
    // Goals are exact: slot offsets vanish and envelopes decay to zero at
    // both ends of the local window, so rest needs no convergence.
    for (let i = 0; i < 10; i++) {
      // Negative zero is still zero rest: (i - 4.5) * gap * 0.
      expect(layerOffset(i, 10, LAYER_GAP, 0)).toBeCloseTo(0, 12)
    }
    const frame: FeatureFrame = { detach: 0, turn: 0, scale: 0 }
    for (const weight of ['light', 'medium', 'heavy'] as const) {
      featureFrame(0, weight, frame)
      expect(frame.detach).toBe(0)
      expect(frame.turn).toBe(0)
      featureFrame(1, weight, frame)
      expect(frame.detach).toBe(0)
      expect(frame.turn).toBe(0)
      expect(frame.scale).toBe(0)
      featureFrame(0, weight, frame, true)
      expect(frame.detach).toBe(0)
    }
  })
})
