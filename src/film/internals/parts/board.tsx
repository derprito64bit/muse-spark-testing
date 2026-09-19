import { useMemo } from 'react'
import * as THREE from 'three'
import type { InternalsMaterialSet } from '../internalsMaterials.ts'

/** Main board: 12-layer slab, RF shield cans, instanced capacitors. */
export function BoardPart({ materials }: { materials: InternalsMaterialSet }) {
  const caps = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.0012, 0.0008, 0.0008)
    const mesh = new THREE.InstancedMesh(geo, materials.dark, 36)
    const m = new THREE.Matrix4()
    let i = 0
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        m.setPosition(-0.028 + col * 0.004, -0.055 + row * 0.006, 0.0009)
        mesh.setMatrixAt(i, m)
        i += 1
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [materials])

  return (
    <group userData={{ part: 'board', readout: '12-layer main board' }}>
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[0.068, 0.15, 0.0008]} />
        <primitive object={materials.board} attach="material" />
      </mesh>
      {/* Gold trace strips */}
      {[-0.02, 0.012].map((x) => (
        <mesh key={x} position={[x, -0.01, 0.0005]}>
          <boxGeometry args={[0.004, 0.13, 0.0002]} />
          <primitive object={materials.trace} attach="material" />
        </mesh>
      ))}
      {/* RF shield cans */}
      <mesh position={[-0.018, 0.045, 0.0014]}>
        <boxGeometry args={[0.02, 0.014, 0.002]} />
        <primitive object={materials.shield} attach="material" />
      </mesh>
      <mesh position={[0.016, -0.045, 0.0014]}>
        <boxGeometry args={[0.016, 0.02, 0.002]} />
        <primitive object={materials.shield} attach="material" />
      </mesh>
      <primitive object={caps} />
    </group>
  )
}
