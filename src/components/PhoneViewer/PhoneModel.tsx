import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { CameraAssembly } from './CameraAssembly.tsx'
import { usePhoneConfig, type FocusLensId } from './PhoneConfig.tsx'
import {
  BACK_FACE,
  BACK_PANEL,
  BEZEL,
  CERAMIC_FACE_Z,
  DIM,
  DISPLAY_INSET,
  DISPLAY_PANEL,
  FLASH,
  FRONT_GLASS,
  GRILLE_SLOT,
  GRILLE_XS,
  ISLAND,
  ISLAND_FACE_Z,
  ISLAND_SEAT,
  PORT_COLLAR,
  SX,
  SY,
} from './phoneDimensions.ts'
import {
  createFrameBodyGeometry,
  createFrameRingGeometry,
  createRoundedRectGeometry,
  createSeatRingGeometry,
  createSlabGeometry,
  createSquircleGeometry,
} from './phoneGeometry.ts'
import {
  FINISH_COLORS,
  FINISH_PARAMS,
  createPhoneMaterials,
  type PhoneMaterialSet,
} from './phoneMaterials.ts'

interface PhoneModelProps {
  /** Optional per-instance material set (the film passes its own for x-ray). */
  materials?: PhoneMaterialSet
  /** Optional shell sub-groups so a director can part the layers. */
  groups?: Partial<Record<'frame' | 'back' | 'glass', MutableRefObject<THREE.Group | null>>>
  /** Animated focus ring on the active lens. The film disables this. */
  animateFocusRing?: boolean
}

const LENSES: Array<{ key: FocusLensId }> = [{ key: 'main' }, { key: 'ultra' }, { key: 'tele' }]

/** Procedurally built, finish-reactive phone model. Pure geometry and materials. */
export function PhoneModel({ materials, groups, animateFocusRing = true }: PhoneModelProps) {
  const ownMaterials = useMemo(
    () => (materials ? null : createPhoneMaterials(FINISH_PARAMS.obsidian)),
    [materials],
  )
  const set = materials ?? ownMaterials
  if (set === null) return null

  return <PhoneModelInner set={set} groups={groups} animateFocusRing={animateFocusRing} />
}

function PhoneModelInner({
  set,
  groups,
  animateFocusRing,
}: {
  set: PhoneMaterialSet
  groups: PhoneModelProps['groups']
  animateFocusRing: boolean
}) {
  const { finish, focusLens } = usePhoneConfig()
  const smooth = useRef({
    frameColor: FINISH_COLORS.obsidian.frame.clone(),
    backColor: FINISH_COLORS.obsidian.back.clone(),
    islandColor: FINISH_COLORS.obsidian.island.clone(),
    backMetal: FINISH_PARAMS.obsidian.backMetalness,
    backRough: FINISH_PARAMS.obsidian.backRoughness,
    frameRough: FINISH_PARAMS.obsidian.frameRoughness,
    frameAniso: FINISH_PARAMS.obsidian.frameAnisotropy,
  })

  const islandGeometry = useMemo(
    () => createSquircleGeometry(ISLAND.size, ISLAND.size, ISLAND.depth),
    [],
  )
  const islandSeatGeometry = useMemo(
    () => createSeatRingGeometry(ISLAND_SEAT.size, ISLAND_SEAT.lip, ISLAND_SEAT.depth),
    [],
  )
  const frameBodyGeometry = useMemo(() => createFrameBodyGeometry(BACK_FACE), [])
  const frameRingGeometry = useMemo(() => createFrameRingGeometry(), [])
  const backSlabGeometry = useMemo(
    () => createSlabGeometry(DIM.w - BEZEL * 2, DIM.h - BEZEL * 2, BACK_PANEL.depth, 0.0013),
    [],
  )
  const glassSlabGeometry = useMemo(
    () => createSlabGeometry(DIM.w - BEZEL * 2, DIM.h - BEZEL * 2, FRONT_GLASS.depth, 0.0011),
    [],
  )
  const displaySlabGeometry = useMemo(
    () =>
      createSlabGeometry(
        DIM.w - BEZEL * 2 - DISPLAY_INSET * 2,
        DIM.h - BEZEL * 2 - DISPLAY_INSET * 2,
        DISPLAY_PANEL.depth,
        0.0006,
        0.0001,
      ),
    [],
  )
  const lensRefs = useRef<Partial<Record<FocusLensId, THREE.Group>>>({})
  const focusRef = useRef<{ key: FocusLensId | null; blend: number }>({ key: focusLens, blend: 0 })

  // Writes into three.js objects per frame without React state. This is the
  // sanctioned R3F hot path: scratch-owned colors, zero allocation.
  // oxlint-disable-next-line react/immutability
  useFrame((state, delta) => {
    const targetColors = FINISH_COLORS[finish]
    const targetParams = FINISH_PARAMS[finish]
    const k = 1 - Math.exp(-delta * 5.5)
    const s = smooth.current
    s.frameColor.lerp(targetColors.frame, k)
    s.backColor.lerp(targetColors.back, k)
    s.islandColor.lerp(targetColors.island, k)
    s.backMetal += (targetParams.backMetalness - s.backMetal) * k
    s.backRough += (targetParams.backRoughness - s.backRough) * k
    s.frameRough += (targetParams.frameRoughness - s.frameRough) * k
    s.frameAniso += (targetParams.frameAnisotropy - s.frameAniso) * k

    set.frame.color.copy(s.frameColor)
    set.frame.roughness = s.frameRough
    set.frame.anisotropy = s.frameAniso
    set.back.color.copy(s.backColor)
    set.back.metalness = s.backMetal
    set.back.roughness = s.backRough
    set.island.color.copy(s.islandColor)

    const focus = focusRef.current
    if (focus.key !== focusLens) {
      focus.key = focusLens
      focus.blend = 0
    }
    focus.blend = Math.min(1, focus.blend + delta * 6)
    const t = state.clock.elapsedTime
    for (const lens of LENSES) {
      const group = lensRefs.current[lens.key]
      if (!group) continue
      const active = focus.key === lens.key
      const pulse = active ? Math.sin(t * 2.4) * 0.004 : 0
      const scale = 1 + ((active ? 1.04 : 1) - 1) * focus.blend + pulse
      group.scale.setScalar(scale)
      const ring = group.children.find((child) => child.name === 'focus-ring') as
        THREE.Mesh | undefined
      if (ring !== undefined && animateFocusRing) {
        const targetOpacity = active ? 0.55 + Math.sin(t * 3) * 0.12 : 0
        set.focusRing.opacity += (targetOpacity - set.focusRing.opacity) * 0.12
      }
    }
  })

  return (
    <group>
      <group ref={groups?.frame}>
        <mesh geometry={frameBodyGeometry} castShadow>
          <primitive object={set.frame} attach="material" />
        </mesh>
        <mesh geometry={frameRingGeometry} castShadow>
          <primitive object={set.frame} attach="material" />
        </mesh>
        <EdgeDetails set={set} />
      </group>
      <group ref={groups?.back}>
        <mesh geometry={backSlabGeometry} position={[0, 0, BACK_PANEL.z]}>
          <primitive object={set.back} attach="material" />
        </mesh>
        <mesh
          geometry={islandSeatGeometry}
          position={[ISLAND.x, ISLAND.y, ISLAND_FACE_Z]}
          castShadow
        >
          <primitive object={set.island} attach="material" />
        </mesh>
        <CameraAssembly materials={set} geometry={islandGeometry} lensRefs={lensRefs} />
        <FlashModule materials={set} />
        <mesh position={[0, -0.065, BACK_FACE - 0.00006]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.016, 0.004]} />
          <primitive object={set.logo} attach="material" />
        </mesh>
      </group>
      <group ref={groups?.glass}>
        <mesh geometry={glassSlabGeometry} position={[0, 0, FRONT_GLASS.z]}>
          <primitive object={set.screen} attach="material" />
        </mesh>
        <mesh geometry={displaySlabGeometry} position={[0, 0, DISPLAY_PANEL.z]}>
          <primitive object={set.display} attach="material" />
        </mesh>
        <FrontGlassDetails set={set} />
      </group>
    </group>
  )
}

function FlashModule({ materials: set }: { materials: PhoneMaterialSet }) {
  return (
    <group position={[FLASH.x, FLASH.y, CERAMIC_FACE_Z - 0.00004]}>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, 0.00012]}>
        <circleGeometry args={[FLASH.radius + 0.00045, 28]} />
        <primitive object={set.flashRing} attach="material" />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[FLASH.radius, FLASH.radius + 0.00045, 28]} />
        <primitive object={set.flashRing} attach="material" />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, 0.00008]}>
        <circleGeometry args={[FLASH.radius, 28]} />
        <primitive object={set.flashGlass} attach="material" />
      </mesh>
    </group>
  )
}

function EdgeDetails({ set }: { set: PhoneMaterialSet }) {
  const portCollarGeo = useMemo(
    () =>
      createRoundedRectGeometry(
        PORT_COLLAR.w,
        PORT_COLLAR.h,
        PORT_COLLAR.r,
        PORT_COLLAR.depth,
        0.00015,
        0.00013,
      ),
    [],
  )
  return (
    <group>
      <ButtonPocket set={set} y={0.02} height={0.0125} />
      <ButtonPocket set={set} y={0.047} height={0.006} />
      <ButtonPocket set={set} y={0.058} height={0.0055} />
      <Seam set={set} x={SX + 0.0002} y={0.026} />
      <Seam set={set} x={SX + 0.0002} y={-0.024} />
      <Seam set={set} x={-SX - 0.0002} y={0.058} />
      <Seam set={set} x={-SX - 0.0002} y={-0.042} />
      <mesh position={[-SX - 0.00018, 0.05, 0]}>
        <boxGeometry args={[0.0003, 0.0062, 0.0014]} />
        <primitive object={set.simTray} attach="material" />
      </mesh>
      <mesh geometry={portCollarGeo} position={[0, -SY - 0.0002, 0]}>
        <primitive object={set.simTray} attach="material" />
      </mesh>
      <mesh position={[0, -SY - 0.00012, 0]}>
        <boxGeometry args={[0.0048, 0.0008, 0.0017]} />
        <primitive object={set.port} attach="material" />
      </mesh>
      <mesh position={[0.0051, -SY + 0.0002, 0.0016]}>
        <cylinderGeometry args={[0.0004, 0.0004, 0.00034, 12]} />
        <primitive object={set.port} attach="material" />
      </mesh>
      {GRILLE_XS.map((x) => (
        <mesh key={x} position={[x, -SY + 0.0003, 0]}>
          <boxGeometry args={[GRILLE_SLOT.w, GRILLE_SLOT.h, GRILLE_SLOT.depth]} />
          <primitive object={set.speaker} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function FrontGlassDetails({ set }: { set: PhoneMaterialSet }) {
  return (
    <group>
      <mesh position={[0, 0.0744, FRONT_GLASS.z + 0.00078]}>
        <boxGeometry args={[0.0034, 0.0005, 0.00022]} />
        <primitive object={set.speaker} attach="material" />
      </mesh>
      {[0.0042, -0.0042].map((x) => (
        <mesh
          key={x}
          position={[x, -0.077, FRONT_GLASS.z + 0.00078]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.00038, 0.00038, 0.0002, 12]} />
          <primitive object={set.speaker} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.065, FRONT_GLASS.z + 0.00085]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.00078, 0.00078, 0.00025, 20]} />
        <primitive object={set.port} attach="material" />
      </mesh>
      <mesh position={[0.0042, 0.065, FRONT_GLASS.z + 0.00085]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.00034, 0.00034, 0.00025, 12]} />
        <primitive object={set.port} attach="material" />
      </mesh>
    </group>
  )
}

function ButtonPocket({ set, y, height }: { set: PhoneMaterialSet; y: number; height: number }) {
  const flangeGeo = useMemo(
    () => createRoundedRectGeometry(0.0005, height + 0.002, 0.0004, 0.0017, 0.00012, 0.00012),
    [height],
  )
  const capGeo = useMemo(
    () => createSlabGeometry(0.0005, height, 0.0014, Math.min(0.00022, height / 2), 0.00008),
    [height],
  )
  return (
    <group position={[SX + 0.0004, y, -0.0012]}>
      <mesh position={[0, 0, 0.0006]}>
        <boxGeometry args={[0.0007, height + 0.0016, 0.0028]} />
        <primitive object={set.antenna} attach="material" />
      </mesh>
      <mesh geometry={flangeGeo} position={[0.00035, 0, 0.0006]}>
        <primitive object={set.frame} attach="material" />
      </mesh>
      <mesh geometry={capGeo} position={[0.0007, 0, 0.0006]}>
        <primitive object={set.button} attach="material" />
      </mesh>
    </group>
  )
}

function Seam({ set, x, y }: { set: PhoneMaterialSet; x: number; y: number }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[0.00026, 0.003, DIM.t]} />
      <primitive object={set.antenna} attach="material" />
    </mesh>
  )
}
