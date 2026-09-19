import type { InternalsMaterialSet } from '../internalsMaterials.ts'

/** A1 Ultra package: substrate, silicon die, gold lid marking. Lifts on chipLift. */
export function SiliconPart({ materials }: { materials: InternalsMaterialSet }) {
  return (
    <group userData={{ part: 'die', readout: 'A1 Ultra · 3 nm · 171 mm2' }}>
      <mesh position={[0.011, 0.098, 0.0012]}>
        <boxGeometry args={[0.016, 0.016, 0.0008]} />
        <primitive object={materials.substrate} attach="material" />
      </mesh>
      <mesh position={[0.011, 0.098, 0.002]}>
        <boxGeometry args={[0.011, 0.011, 0.0007]} />
        <primitive object={materials.die} attach="material" />
      </mesh>
      {/* Gold corner marks */}
      {(
        [
          [-0.004, -0.004],
          [0.004, -0.004],
          [-0.004, 0.004],
          [0.004, 0.004],
        ] as Array<[number, number]>
      ).map(([dx, dy]) => (
        <mesh key={`${dx}${dy}`} position={[0.011 + dx, 0.098 + dy, 0.0024]}>
          <boxGeometry args={[0.0012, 0.0012, 0.0002]} />
          <primitive object={materials.gold} attach="material" />
        </mesh>
      ))}
      {/* Additive circuit ring under focus (M5 lights it via die emissive) */}
      <mesh position={[0.011, 0.098, 0.0006]}>
        <ringGeometry args={[0.009, 0.0105, 48]} />
        <primitive object={materials.trace} attach="material" />
      </mesh>
    </group>
  )
}
