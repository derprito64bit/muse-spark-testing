import type { InternalsMaterialSet } from '../internalsMaterials.ts'

/** Rear optical housings and flash well, seen from inside the shell. */
export function OpticsPart({ materials }: { materials: InternalsMaterialSet }) {
  return (
    <group userData={{ part: 'optics', readout: '50 MP main · 1/1.3 in sensor' }}>
      {[
        { x: -0.028, y: 0.058, r: 0.0062 },
        { x: -0.0135, y: 0.058, r: 0.0048 },
        { x: -0.0208, y: 0.0435, r: 0.0054 },
      ].map((lens) => (
        <group key={lens.x} position={[lens.x, lens.y, -0.001]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[lens.r, lens.r * 1.1, 0.0024, 24]} />
            <primitive object={materials.housing} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0004]}>
            <circleGeometry args={[lens.r * 0.7, 24]} />
            <primitive object={materials.dark} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.004, 0.0694, -0.001]}>
        <cylinderGeometry args={[0.0026, 0.0026, 0.0012, 20]} />
        <primitive object={materials.housing} attach="material" />
      </mesh>
    </group>
  )
}
