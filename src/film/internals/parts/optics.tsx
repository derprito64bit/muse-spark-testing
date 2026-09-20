import { LENS_LAYOUT } from '../../../components/PhoneViewer/phoneDimensions.ts'
import { islandUpperCenter } from '../../../components/PhoneViewer/CameraAssembly.tsx'
import type { InternalsMaterialSet } from '../internalsMaterials.ts'
import type { PartRegister } from './register.ts'

/** Rear optical housings mirroring the plateau module, seen from inside. */
export function OpticsPart({
  materials,
  register,
}: {
  materials: InternalsMaterialSet
  register: PartRegister
}) {
  const center = islandUpperCenter()
  return (
    <group userData={{ part: 'optics', readout: '50 MP main · 1/1.3 in sensor' }}>
      <group ref={register('sensor-stack')}>
        <mesh position={[center.x, center.y, -0.001]}>
          <cylinderGeometry args={[0.0131, 0.0131, 0.0024, 48]} />
          <primitive object={materials.housing} attach="material" />
        </mesh>
      </group>
      {LENS_LAYOUT.map((lens) => (
        <group
          key={lens.key}
          ref={register(`lens-${lens.key}`)}
          position={[center.x + lens.dx, center.y + lens.dy, -0.001]}
        >
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
    </group>
  )
}
