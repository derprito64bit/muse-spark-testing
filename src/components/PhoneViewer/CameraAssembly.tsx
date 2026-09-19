import { useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { PhoneMaterialSet } from './phoneMaterials.ts'
import type { FocusLensId } from './PhoneConfig.tsx'

export interface OpticsControl {
  optics: number
  visible: boolean
}

interface CameraAssemblyProps {
  materials: PhoneMaterialSet
  geometry: THREE.BufferGeometry
  lensRefs: MutableRefObject<Partial<Record<FocusLensId, THREE.Group>>>
}

const LENS_LAYOUT: Array<{ key: FocusLensId; x: number; y: number; r: number }> = [
  { key: 'main', x: -0.028, y: 0.058, r: 0.0062 },
  { key: 'ultra', x: -0.0135, y: 0.058, r: 0.0048 },
  { key: 'tele', x: -0.0208, y: 0.0435, r: 0.0054 },
]

/** Rear camera pad with three optical assemblies seated against the ceramic. */
export function CameraAssembly({ materials, geometry, lensRefs }: CameraAssemblyProps) {
  const barrelGeos = useMemo(
    () =>
      LENS_LAYOUT.map(
        (lens) => new THREE.CylinderGeometry(lens.r * 0.82, lens.r * 0.88, 0.0016, 28),
      ),
    [],
  )
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <primitive object={materials.island} attach="material" />
      </mesh>
      {LENS_LAYOUT.map((lens, index) => {
        const barrel = barrelGeos[index]
        if (barrel === undefined) return null
        return (
          <group
            key={lens.key}
            position={[lens.x, lens.y, -0.0044]}
            ref={(group: THREE.Group | null) => {
              if (group !== null) lensRefs.current[lens.key] = group
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0011]}>
              <cylinderGeometry args={[lens.r + 0.0009, lens.r + 0.0011, 0.0009, 32]} />
              <primitive object={materials.lensRing} attach="material" />
            </mesh>
            <mesh geometry={barrel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0004]}>
              <primitive object={materials.lensBarrel} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0013]}>
              <circleGeometry args={[lens.r, 32]} />
              <primitive object={materials.lensGlass} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0009]} name="focus-ring">
              <ringGeometry args={[lens.r + 0.0011, lens.r + 0.0017, 32]} />
              <primitive object={materials.focusRing} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0002]}>
              <circleGeometry args={[lens.r * 0.34, 20]} />
              <primitive object={materials.sensorGlint} attach="material" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
