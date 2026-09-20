import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  BEZEL,
  CHAMFER,
  ISLAND_FLASH,
  ISLAND_LOWER,
  ISLAND_N,
  ISLAND_RANGE,
  ISLAND_UPPER,
  LENS_LAYOUT,
  DIM,
  DISPLAY_INSET,
  DISPLAY_PANEL,
  BACK_PANEL,
  BACK_FACE,
  FRONT_GLASS,
  GRILLE_SLOT,
  MIC_R,
  PORT,
  SPEAKER_XS,
  THREAD_RING,
} from './phoneDimensions.ts'
import {
  createFrameBodyGeometry,
  createFrameRingGeometry,
  createPlateauGeometry,
  createRoundedRectGeometry,
  createSlabGeometry,
} from './phoneGeometry.ts'
import { superellipsePoints } from '../../lib/superellipse.ts'

/**
 * Triangle budget, Prompt A section 11. Every entry mirrors the constructor
 * arguments in PhoneModel.tsx and CameraAssembly.tsx one to one; if those
 * change, this file must change in the same commit. Instanced meshes count
 * every instance. Draw calls and texture memory are recorded in
 * docs/device-perf.md alongside these numbers.
 */
function tris(geometry: THREE.BufferGeometry, instances = 1): number {
  const index = geometry.index
  const count = index !== null ? index.count / 3 : geometry.getAttribute('position').count / 3
  geometry.dispose()
  return count * instances
}

function box(w: number, h: number, d: number, instances = 1): number {
  return tris(new THREE.BoxGeometry(w, h, d), instances)
}

function lensTris(r: number, barrelDepth: number, baffles: number): number {
  let total = 0
  total += tris(new THREE.CylinderGeometry(r + 0.0009, r + 0.0012, 0.0006, 40))
  total += tris(new THREE.SphereGeometry(r, 40, 8, 0, Math.PI * 2, 0, 0.18))
  total += tris(new THREE.CylinderGeometry(r * 0.86, r * 0.8, barrelDepth, 32, 1, true))
  for (let i = 0; i < baffles; i++) {
    total += tris(new THREE.TorusGeometry(r * 0.78, 0.00022, 8, 32))
  }
  total += tris(new THREE.SphereGeometry(r * 0.6, 32, 8, 0, Math.PI * 2, 0, 1.1))
  total += tris(new THREE.RingGeometry(r * 0.3, r * 0.42, 7))
  total += tris(new THREE.CircleGeometry(r * 0.5, 24))
  total += tris(new THREE.RingGeometry(r + 0.0011, r + 0.0017, 40))
  return total
}

function buttonPocketTris(height: number, power: boolean): number {
  let total = 0
  total += tris(
    createRoundedRectGeometry(0.0003, height + 0.0002, 0.0004, 0.0017, CHAMFER.button, 0.00012),
  )
  total += tris(
    createSlabGeometry(0.0005, height, 0.0014, Math.min(0.00022, height / 2), CHAMFER.button),
  )
  total += box(0.0006, height + 0.0002, 0.0016)
  if (power) total += box(0.0001, 0.00006, 0.0002, 3)
  return total
}

function measure(detail: 'high' | 'low'): { total: number; rows: Array<[string, number]> } {
  const rows: Array<[string, number]> = []
  const add = (name: string, value: number): void => {
    rows.push([name, Math.round(value)])
  }
  const coarse = detail === 'low'

  add('frameBody', tris(createFrameBodyGeometry(BACK_FACE, coarse)))
  add('frameRing', tris(createFrameRingGeometry(coarse)))
  const panelW = DIM.w - BEZEL * 2
  const panelH = DIM.h - BEZEL * 2
  add('backSlab', tris(createSlabGeometry(panelW, panelH, BACK_PANEL.depth, 0.0013)))
  add('glassSlab', tris(createSlabGeometry(panelW, panelH, FRONT_GLASS.depth, 0.0011)))
  add(
    'displaySlab',
    tris(
      createSlabGeometry(
        panelW - DISPLAY_INSET * 2,
        panelH - DISPLAY_INSET * 2,
        DISPLAY_PANEL.depth,
        0.0006,
        0.0001,
      ),
    ),
  )
  add('logo', tris(new THREE.PlaneGeometry(0.016, 0.004)))
  if (detail === 'high') {
    add('regulatory', tris(new THREE.PlaneGeometry(0.012, 0.0022)))
    add(
      'subpixel',
      tris(new THREE.PlaneGeometry(panelW - DISPLAY_INSET * 2, panelH - DISPLAY_INSET * 2)),
    )
  }
  add('panelGaps', box(DIM.w - 0.004, 0.00012, 0.0002, 2))

  // Plateau module: base lip, two squircle tiers, instanced thread ring.
  let dial = 0
  dial += tris(createPlateauGeometry(ISLAND_LOWER.size / 2 + 0.0005, 0.0002, 0))
  dial += tris(
    createPlateauGeometry(ISLAND_LOWER.size / 2, ISLAND_LOWER.depth, CHAMFER.plateauStep),
  )
  dial += tris(
    createPlateauGeometry(ISLAND_UPPER.size / 2, ISLAND_UPPER.depth, CHAMFER.plateauStep),
  )
  if (detail === 'high') {
    dial += tris(new THREE.BoxGeometry(0.00022, 0.00022, THREAD_RING.depth), THREAD_RING.teeth)
    dial += tris(new THREE.BoxGeometry(0.00026, 0.00026, 0.0005), 3 * 40)
  }
  // Squircle thread outline is dense by construction; assert it stays so.
  expect(superellipsePoints(0.0167, 0.0167, ISLAND_N, 24)).toHaveLength(THREAD_RING.teeth)
  for (const lens of LENS_LAYOUT) {
    dial += lensTris(lens.r, lens.barrelDepth, detail === 'high' ? 2 : 1)
  }
  dial += box(ISLAND_FLASH.w, ISLAND_FLASH.h, 0.0004)
  dial += tris(new THREE.CircleGeometry(0.0011, 20), 2)
  dial += tris(new THREE.CircleGeometry(ISLAND_RANGE.r, 24))
  dial += tris(new THREE.RingGeometry(ISLAND_RANGE.r, ISLAND_RANGE.r + 0.0004, 24))
  add('plateauModule', dial)

  // Edge hardware.
  let edge = 0
  edge += buttonPocketTris(0.014, true)
  edge += buttonPocketTris(0.032, false)
  edge += box(0.0004, 0.0014, 0.004, 4)
  edge += box(0.0001, 0.0065, 0.0017)
  edge += box(0.0004, 0.0062, 0.0014)
  edge += tris(new THREE.CylinderGeometry(0.0003, 0.0003, 0.0004, 10))
  edge += tris(
    createRoundedRectGeometry(PORT.w, PORT.h, PORT.r, 0.0005, CHAMFER.portMouth, 0.00013),
  )
  edge += box(PORT.w - 0.0012, 0.0012, PORT.cavityDepth)
  if (detail === 'high') {
    edge += box(PORT.tongue.w, PORT.tongue.h, PORT.tongue.depth)
    edge += box(0.005, 0.0002, 0.0001)
  }
  edge += box(GRILLE_SLOT.w, GRILLE_SLOT.h, GRILLE_SLOT.depth, SPEAKER_XS.length)
  edge += tris(new THREE.CylinderGeometry(MIC_R, MIC_R, 0.0012, 12))
  edge += tris(new THREE.CylinderGeometry(0.00035, 0.00035, 0.001, 10))
  edge += box(0.003, 0.0005, 0.001)
  add('edgeHardware', edge)

  // Front sensors.
  let front = 0
  front += box(0.012, 0.0006, 0.00022)
  front += tris(new THREE.CylinderGeometry(0.0016, 0.0016, 0.00025, 24))
  front += tris(new THREE.RingGeometry(0.0016, 0.00175, 24))
  front += tris(new THREE.CircleGeometry(0.00028, 12))
  add('frontSensors', front)

  const total = rows.reduce((sum, [, value]) => sum + value, 0)
  return { total, rows }
}

describe('device triangle budget', () => {
  it('holds LOD0 under 120k triangles', () => {
    const { total, rows } = measure('high')
    console.log(`LOD0 triangle breakdown (total ${total.toLocaleString()}):`)
    for (const [name, value] of rows) {
      console.log(`  ${name}: ${value.toLocaleString()}`)
    }
    expect(total).toBeLessThan(120_000)
  })

  it('cuts real geometry at LOD1', () => {
    const high = measure('high')
    const low = measure('low')
    console.log(`LOD1 total ${low.total.toLocaleString()} vs LOD0 ${high.total.toLocaleString()}`)
    expect(low.total).toBeLessThan(high.total * 0.85)
    expect(low.total).toBeLessThan(60_000)
  })
})
