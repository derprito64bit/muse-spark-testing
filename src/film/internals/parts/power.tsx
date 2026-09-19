import type { InternalsMaterialSet } from '../internalsMaterials.ts'

/** Power stack: silicon-carbon cell, wireless coil, board connector. */
export function PowerPart({ materials }: { materials: InternalsMaterialSet }) {
  return (
    <group>
      <group userData={{ part: 'cell', readout: '5200 mAh silicon-carbon cell' }}>
        <mesh position={[0, -0.028, -0.0012]}>
          <boxGeometry args={[0.06, 0.095, 0.0038]} />
          <primitive object={materials.cell} attach="material" />
        </mesh>
        {/* Glowing edge band that blooms at the energy climax */}
        <mesh position={[0, -0.028, 0.0009]}>
          <boxGeometry args={[0.061, 0.096, 0.0004]} />
          <primitive object={materials.cellGlow} attach="material" />
        </mesh>
      </group>
      <group userData={{ part: 'coil', readout: '40 W wireless coil' }}>
        <mesh position={[0, 0.045, -0.0016]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.014, 0.0016, 10, 40]} />
          <primitive object={materials.coil} attach="material" />
        </mesh>
        <mesh position={[0, 0.045, -0.0016]}>
          <torusGeometry args={[0.009, 0.0014, 10, 32]} />
          <primitive object={materials.coil} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
