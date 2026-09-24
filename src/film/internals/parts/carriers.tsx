import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { DIM } from '../../../components/PhoneViewer/phoneDimensions.ts'
import { TEARDOWN_LAYERS } from '../../teardown/layers.ts'
import type { PartRegister } from './register.ts'

/**
 * Carrier plates (round 03 A.5, option a): the five internals-only layers
 * (battery, logic-board, silicon, thermal, power-coil) are sparse
 * component clusters that read as debris edge-on, not strata. Each gets a
 * thin, mostly transparent substrate quad at its slot, phone footprint, so
 * all ten layers read as layers. Driven per-layer by the Internals loop
 * through the shared applyLayerTransform helper; visible only while the
 * stack is separated.
 */
export interface CarrierPlateDef {
  id: string
  layer: number
}

export const CARRIER_PLATES: readonly CarrierPlateDef[] = TEARDOWN_LAYERS.filter(
  (l) => l.shell.length === 0,
).map((l) => ({ id: `carrier-${l.index}`, layer: l.index }))

export function CarrierPlates({
  register,
  material,
}: {
  register: PartRegister
  material: THREE.Material
}) {
  const geo = useMemo(() => new THREE.PlaneGeometry(DIM.w, DIM.h), [])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <group>
      {CARRIER_PLATES.map((carrier) => (
        <group
          key={carrier.id}
          ref={register(carrier.id)}
          userData={{ part: carrier.id, readout: `${TEARDOWN_LAYERS[carrier.layer]?.id} carrier` }}
        >
          <mesh>
            <primitive object={geo} attach="geometry" />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
