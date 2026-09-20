import type { InternalsMaterialSet } from '../internalsMaterials.ts'
import type { PartRegister } from './register.ts'

/** Power stack: silicon-carbon cell, wireless coil, board connector. */
export function PowerPart({
  materials,
  register,
}: {
  materials: InternalsMaterialSet
  register: PartRegister
}) {
  return (
    <group>
      <group ref={register('cell')}>
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
      </group>
      {/* Cell wrap peels before the cell lifts: two-stage reveal. Open
          sleeve bands, so the cell face stays visible until the peel. */}
      <group ref={register('cell-wrap')}>
        {[-0.07575, 0.01975].map((y) => (
          <mesh key={y} position={[0, y, -0.0012]}>
            <boxGeometry args={[0.0615, 0.002, 0.0041]} />
            <primitive object={materials.dark} attach="material" />
          </mesh>
        ))}
        {[-0.02975, 0.02975].map((x) => (
          <mesh key={x} position={[x, -0.028, -0.0012]}>
            <boxGeometry args={[0.002, 0.0935, 0.0041]} />
            <primitive object={materials.dark} attach="material" />
          </mesh>
        ))}
      </group>
      <group ref={register('charge-coil')}>
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
      <group ref={register('protection-board')}>
        <mesh position={[0, -0.082, -0.0012]}>
          <boxGeometry args={[0.05, 0.008, 0.001]} />
          <primitive object={materials.board} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
