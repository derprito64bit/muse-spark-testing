import { useMemo } from 'react'
import * as THREE from 'three'
import type { InternalsMaterialSet } from '../internalsMaterials.ts'
import type { PartRegister } from './register.ts'

/**
 * A1 Ultra package as a real assembly: substrate with routing, instanced
 * BGA ball array revealed on lift, marked die with floorplan detail,
 * decoupling caps, perforated shield lid, and graphite thermal plate.
 */
export function SiliconPart({
  materials,
  register,
}: {
  materials: InternalsMaterialSet
  register: PartRegister
}) {
  const bga = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.00035, 8, 8)
    const mesh = new THREE.InstancedMesh(geo, materials.gold, 196)
    const m = new THREE.Matrix4()
    let i = 0
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 14; c++) {
        m.setPosition(0.011 - 0.0065 + c * 0.001, 0.098 - 0.0065 + r * 0.001, 0.0005)
        mesh.setMatrixAt(i, m)
        i += 1
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [materials])
  const caps = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.001, 0.0005, 0.0004)
    const mesh = new THREE.InstancedMesh(geo, materials.dark, 12)
    const m = new THREE.Matrix4()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      m.setPosition(0.011 + Math.cos(a) * 0.0105, 0.098 + Math.sin(a) * 0.0105, 0.0014)
      mesh.setMatrixAt(i, m)
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [materials])

  return (
    <group userData={{ part: 'die', readout: 'A1 Ultra · 3 nm · 171 mm2' }}>
      <group ref={register('substrate')}>
        <mesh position={[0.011, 0.098, 0.0012]}>
          <boxGeometry args={[0.016, 0.016, 0.0008]} />
          <primitive object={materials.substrate} attach="material" />
        </mesh>
        {/* Additive circuit ring under focus */}
        <mesh position={[0.011, 0.098, 0.0006]}>
          <ringGeometry args={[0.009, 0.0105, 48]} />
          <primitive object={materials.trace} attach="material" />
        </mesh>
      </group>
      <group ref={register('bga-array')}>
        <primitive object={bga} />
      </group>
      <group ref={register('die')}>
        <mesh position={[0.011, 0.098, 0.002]}>
          <boxGeometry args={[0.011, 0.011, 0.0007]} />
          <primitive object={materials.die} attach="material" />
        </mesh>
        {/* Laser marking decal, low contrast */}
        <mesh position={[0.011, 0.098, 0.00236]}>
          <planeGeometry args={[0.009, 0.009]} />
          <primitive object={materials.dieMark} attach="material" />
        </mesh>
        {/* Floorplan detail modulating the die top */}
        <mesh position={[0.011, 0.098, 0.00237]}>
          <planeGeometry args={[0.0105, 0.0105]} />
          <primitive object={materials.dieFloor} attach="material" />
        </mesh>
      </group>
      <group ref={register('decoupling-cluster')}>
        <primitive object={caps} />
      </group>
      {/* Perforated EMI shield lid above the package */}
      <group ref={register('shield-lid')}>
        <mesh position={[0.011, 0.098, 0.0042]}>
          <boxGeometry args={[0.02, 0.02, 0.0004]} />
          <primitive object={materials.shield} attach="material" />
        </mesh>
      </group>
      {/* Graphite thermal plate above the shield */}
      <group ref={register('thermal-plate')}>
        <mesh position={[0.011, 0.098, 0.0052]}>
          <boxGeometry args={[0.022, 0.022, 0.0003]} />
          <primitive object={materials.dark} attach="material" />
        </mesh>
      </group>
      {/* Graphite interface sheet, separates first */}
      <group ref={register('graphite-sheet')}>
        <mesh position={[0.011, 0.098, 0.0056]}>
          <boxGeometry args={[0.024, 0.024, 0.00012]} />
          <primitive object={materials.dark} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
