import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createFrameRingGeometry } from './phoneGeometry.ts'
import { assignRailGroups } from './phoneGeometry.ts'

/** The bezel ring must have an open display cutout at its center. */
function centerHits(geometry: THREE.BufferGeometry): number {
  const raycaster = new THREE.Raycaster()
  raycaster.set(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1))
  const mesh = new THREE.Mesh(geometry)
  mesh.updateMatrixWorld(true)
  return raycaster.intersectObject(mesh, false).length
}

describe('frame ring cutout', () => {
  it('leaves the display opening empty before rail grouping', () => {
    const geometry = createFrameRingGeometry()
    expect(centerHits(geometry)).toBe(0)
    geometry.dispose()
  })

  it('leaves the display opening empty after rail grouping', () => {
    const geometry = createFrameRingGeometry()
    assignRailGroups(geometry)
    expect(centerHits(geometry)).toBe(0)
    geometry.dispose()
  })
})
