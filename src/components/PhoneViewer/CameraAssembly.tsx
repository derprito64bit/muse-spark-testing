import { useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { superellipsePoints } from '../../lib/superellipse.ts'
import {
  CERAMIC_FACE_Z,
  CHAMFER,
  ISLAND,
  ISLAND_FLASH,
  ISLAND_LOWER,
  ISLAND_N,
  ISLAND_RANGE,
  ISLAND_UPPER,
  LENS_LAYOUT,
  THREAD_RING,
} from './phoneDimensions.ts'
import { createPlateauGeometry } from './phoneGeometry.ts'
import type { PhoneMaterialSet } from './phoneMaterials.ts'
import type { FocusLensId } from './PhoneConfig.tsx'

export interface OpticsControl {
  optics: number
  visible: boolean
}

export interface LensSpec {
  key: FocusLensId
  x: number
  y: number
  r: number
  coatHue: number
  barrelDepth: number
  glass: keyof Pick<PhoneMaterialSet, 'lensGlassA' | 'lensGlassB' | 'lensGlassC'>
}

const GLASS_FOR: Record<FocusLensId, LensSpec['glass']> = {
  main: 'lensGlassA',
  ultra: 'lensGlassB',
  tele: 'lensGlassC',
}

/** Upper shelf center in phone meters. */
export function islandUpperCenter(): { x: number; y: number } {
  return { x: ISLAND.x + ISLAND_UPPER.dx, y: ISLAND.y + ISLAND_UPPER.dy }
}

/** Lens seats in phone meters, derived from LENS_LAYOUT. */
export function lensSpecs(): LensSpec[] {
  const center = islandUpperCenter()
  return LENS_LAYOUT.map((lens) => ({
    key: lens.key,
    x: center.x + lens.dx,
    y: center.y + lens.dy,
    r: lens.r,
    coatHue: lens.coatHue,
    barrelDepth: lens.barrelDepth,
    glass: GLASS_FOR[lens.key],
  }))
}

interface CameraAssemblyProps {
  materials: PhoneMaterialSet
  lensRefs: MutableRefObject<Partial<Record<FocusLensId, THREE.Group>>>
  /** Low drops knurling, thread ring, and the second baffle (mobile LOD). */
  detail?: 'high' | 'low'
  /**
   * Film-only optical separation refs (`${lens}:${layer}` plus `knurl`).
   * Viewers omit it; layers rest at their assembled offsets.
   */
  separation?: MutableRefObject<Record<string, THREE.Group | null>>
}

/**
 * Camera pad (Prompt A section 5.2). Offset rounded-square two-tier
 * plateau, upper-left: a lower shelf carrying flash and rangefinder, an
 * upper shelf carrying three lens assemblies built by one parametric
 * factory. Rear faces -z: every cover faces the rear viewer.
 */
export function CameraAssembly({
  materials,
  lensRefs,
  detail = 'high',
  separation,
}: CameraAssemblyProps) {
  const specs = useMemo(lensSpecs, [])
  const center = useMemo(islandUpperCenter, [])
  const sep = useMemo(() => {
    const map = separation
    return (name: string) => (g: THREE.Group | null) => {
      if (map !== undefined) map.current[name] = g
    }
  }, [separation])
  const lowerGeometries = useMemo(
    () => ({
      shelf: createPlateauGeometry(ISLAND_LOWER.size / 2, ISLAND_LOWER.depth, CHAMFER.plateauStep),
      lip: createPlateauGeometry(ISLAND_LOWER.size / 2 + 0.0005, 0.0002, 0),
      upper: createPlateauGeometry(ISLAND_UPPER.size / 2, ISLAND_UPPER.depth, CHAMFER.plateauStep),
    }),
    [],
  )
  const knurl = useMemo(() => {
    // One instanced mesh for every collar tooth, rendered once.
    const per = 40
    const total = per * specs.length
    const geo = new THREE.BoxGeometry(0.00026, 0.00026, 0.0005)
    const mesh = new THREE.InstancedMesh(geo, materials.lensBarrel, total)
    const m = new THREE.Matrix4()
    const e = new THREE.Euler()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const sc = new THREE.Vector3(1, 1, 1)
    const z0 = CERAMIC_FACE_Z - ISLAND_LOWER.depth - ISLAND_UPPER.depth
    const z = z0 - 0.00005
    let i = 0
    specs.forEach((spec) => {
      for (let k = 0; k < per; k++) {
        const a = (k / per) * Math.PI * 2
        e.set(0, 0, a)
        q.setFromEuler(e)
        v.set(
          spec.x + Math.cos(a) * (spec.r + 0.00105),
          spec.y + Math.sin(a) * (spec.r + 0.00105),
          z,
        )
        m.compose(v, q, sc)
        mesh.setMatrixAt(i, m)
        i += 1
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [materials, specs])
  const thread = useMemo(() => {
    // Teeth march the squircle pad perimeter, tangent-aligned.
    const outline = superellipsePoints(0.0167, 0.0167, ISLAND_N, 24)
    const total = THREAD_RING.teeth
    const geo = new THREE.BoxGeometry(0.00022, 0.00022, THREAD_RING.depth)
    const mesh = new THREE.InstancedMesh(geo, materials.lensRing, total)
    const m = new THREE.Matrix4()
    const e = new THREE.Euler()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const sc = new THREE.Vector3(1, 1, 1)
    const z = CERAMIC_FACE_Z - ISLAND_LOWER.depth / 2
    for (let k = 0; k < total; k++) {
      const p = outline[k % outline.length] as [number, number]
      const n = outline[(k + 1) % outline.length] as [number, number]
      const a = Math.atan2((n[1] ?? 0) - (p[1] ?? 0), (n[0] ?? 0) - (p[0] ?? 0))
      e.set(0, 0, a)
      q.setFromEuler(e)
      v.set(ISLAND.x + (p[0] ?? 0), ISLAND.y + (p[1] ?? 0), z)
      m.compose(v, q, sc)
      mesh.setMatrixAt(k, m)
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [materials])

  const shelfZ = CERAMIC_FACE_Z - ISLAND_LOWER.depth
  const flashX = ISLAND.x + Math.cos(ISLAND_FLASH.angle) * ISLAND_FLASH.ring
  const flashY = ISLAND.y + Math.sin(ISLAND_FLASH.angle) * ISLAND_FLASH.ring
  const rangeX = ISLAND.x + Math.cos(ISLAND_RANGE.angle) * ISLAND_RANGE.ring
  const rangeY = ISLAND.y + Math.sin(ISLAND_RANGE.angle) * ISLAND_RANGE.ring
  const faceZ = CERAMIC_FACE_Z - ISLAND_LOWER.depth - ISLAND_UPPER.depth

  return (
    <group>
      {/* Base fillet lip: the machined transition into the rear panel */}
      <mesh geometry={lowerGeometries.lip} position={[ISLAND.x, ISLAND.y, CERAMIC_FACE_Z - 0.0001]}>
        <primitive object={materials.island} attach="material" />
      </mesh>
      {/* Lower shelf: full pad disc */}
      <mesh
        geometry={lowerGeometries.shelf}
        position={[ISLAND.x, ISLAND.y, CERAMIC_FACE_Z - ISLAND_LOWER.depth / 2]}
        castShadow
      >
        <primitive object={materials.island} attach="material" />
      </mesh>
      {/* Upper shelf: stepped inner pad with chamfered step */}
      <mesh
        geometry={lowerGeometries.upper}
        position={[center.x, center.y, shelfZ - ISLAND_UPPER.depth / 2]}
        castShadow
      >
        <primitive object={materials.island} attach="material" />
      </mesh>
      {detail === 'high' ? <primitive object={thread} /> : null}
      {/* Knurl stays seated while collars lift: reads as unscrewing. */}
      {detail === 'high' ? <primitive object={knurl} /> : null}
      {specs.map((spec) => (
        <LensAssembly
          key={spec.key}
          spec={spec}
          faceZ={faceZ}
          materials={materials}
          lensRefs={lensRefs}
          detail={detail}
          sep={sep}
        />
      ))}
      {/* Elongated dual-LED flash on the lower shelf */}
      <group position={[flashX, flashY, shelfZ]} rotation={[0, 0, ISLAND_FLASH.angle]}>
        <mesh position={[0, 0, 0.0001]}>
          <boxGeometry args={[ISLAND_FLASH.w, ISLAND_FLASH.h, 0.0004]} />
          <primitive object={materials.flashRing} attach="material" />
        </mesh>
        {[-0.0016, 0.0016].map((dx) => (
          <mesh key={dx} position={[dx, 0, -0.00012]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.0011, 20]} />
            <primitive object={materials.flashGlass} attach="material" />
          </mesh>
        ))}
      </group>
      {/* Rangefinder window with dark red-tinted cover */}
      <group position={[rangeX, rangeY, shelfZ]}>
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.0001]}>
          <circleGeometry args={[ISLAND_RANGE.r, 24]} />
          <primitive object={materials.rangeGlass} attach="material" />
        </mesh>
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.0002]}>
          <ringGeometry args={[ISLAND_RANGE.r, ISLAND_RANGE.r + 0.0004, 24]} />
          <primitive object={materials.flashRing} attach="material" />
        </mesh>
      </group>
    </group>
  )
}

/**
 * One parametric optical assembly built outward from the shelf face (z0,
 * decreasing z is outward). Cover dome, proud knurled collar, gradient
 * barrel, two baffles, front element, aperture hint, iridescent sensor:
 * the receding-ring tunnel. Called three times, never modelled twice.
 */
function LensAssembly({
  spec,
  faceZ,
  materials,
  lensRefs,
  detail,
  sep,
}: {
  spec: LensSpec
  faceZ: number
  materials: PhoneMaterialSet
  lensRefs: CameraAssemblyProps['lensRefs']
  detail: 'high' | 'low'
  sep: (name: string) => (g: THREE.Group | null) => void
}) {
  const glass = materials[spec.glass]
  const z0 = faceZ
  const mouth = z0 + 0.0001
  return (
    <group
      position={[spec.x, spec.y, 0]}
      ref={(group: THREE.Group | null) => {
        if (group !== null) lensRefs.current[spec.key] = group
      }}
    >
      {/* Collar ring, proud 0.35mm */}
      <group ref={sep(`${spec.key}:collar`)}>
        <mesh position={[0, 0, z0 - 0.00005]} castShadow>
          <cylinderGeometry args={[spec.r + 0.0009, spec.r + 0.0012, 0.0006, 40]} />
          <primitive object={materials.lensRing} attach="material" />
        </mesh>
      </group>
      {/* Cover dome at the collar top: highlight slides, never pops */}
      <group ref={sep(`${spec.key}:cover`)}>
        <mesh position={[0, 0, z0 - 0.00035]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[spec.r, 40, 8, 0, Math.PI * 2, 0, 0.18]} />
          <primitive object={glass} attach="material" />
        </mesh>
      </group>
      {/* Barrel wall plus baffles, descending into the module */}
      <group ref={sep(`${spec.key}:barrel`)}>
        <mesh position={[0, 0, mouth + spec.barrelDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[spec.r * 0.86, spec.r * 0.8, spec.barrelDepth, 32, 1, true]} />
          <primitive object={materials.lensBarrel} attach="material" />
        </mesh>
        {/* Two baffle rings catching receding highlights (one on low LOD) */}
        {(detail === 'high' ? [0.35, 0.65] : [0.5]).map((depth) => (
          <mesh key={depth} position={[0, 0, mouth + spec.barrelDepth * depth]}>
            <torusGeometry args={[spec.r * 0.78, 0.00022, 8, 32]} />
            <primitive object={materials.lensBarrel} attach="material" />
          </mesh>
        ))}
      </group>
      {/* Front element deep inside */}
      <group ref={sep(`${spec.key}:element`)}>
        <mesh position={[0, 0, mouth + 0.0009]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[spec.r * 0.6, 32, 8, 0, Math.PI * 2, 0, 1.1]} />
          <primitive object={glass} attach="material" />
        </mesh>
      </group>
      {/* Aperture hint plus sensor plane */}
      <group ref={sep(`${spec.key}:sensor`)}>
        <mesh position={[0, 0, mouth + spec.barrelDepth * 0.8]} rotation={[0, Math.PI, 0]}>
          <ringGeometry args={[spec.r * 0.3, spec.r * 0.42, 7]} />
          <primitive object={materials.lensCavity} attach="material" />
        </mesh>
        <mesh position={[0, 0, mouth + spec.barrelDepth]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[spec.r * 0.5, 24]} />
          <primitive object={materials.sensorGlint} attach="material" />
        </mesh>
      </group>
      <mesh position={[0, 0, z0 - 0.00035]} rotation={[0, Math.PI, 0]} name="focus-ring">
        <ringGeometry args={[spec.r + 0.0011, spec.r + 0.0017, 40]} />
        <primitive object={materials.focusRing} attach="material" />
      </mesh>
    </group>
  )
}
