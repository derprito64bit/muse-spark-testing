import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { INTERNALS_KEYS, type InternalsMaterialSet } from './internalsMaterials.ts'
import { EXPLODE_PARTS, partProgress } from './explode.ts'
import { calloutBridge } from '../overlay/callouts.ts'
import { BoardPart } from './parts/board.tsx'
import { OpticsPart } from './parts/optics.tsx'
import { PowerPart } from './parts/power.tsx'
import type { PartRegister } from './parts/register.ts'
import { SiliconPart } from './parts/silicon.tsx'

/** Mutable per-frame control plane. Written by the director, read here. No React renders. */
export interface InternalsControl {
  opacity: number
  explode: number
  explodeBatt: number
  explodeRadial: number
  chipFocus: number
  chipLift: number
  battLift: number
  subjectDim: number
  energy: number
}

interface InternalsProps {
  materials: InternalsMaterialSet
  control: MutableRefObject<InternalsControl>
}

/** Axial unit per part (rear stack goes rearward), scaled by (1 - fan). */
const AXIAL: Record<string, number> = {}
/** Radial unit per part in the assembly plane. */
const RADIAL: Record<string, THREE.Vector3> = {}
for (const part of EXPLODE_PARTS) {
  AXIAL[part.id] = part.origin[2] < -0.001 ? -1 : 1
  const radial = new THREE.Vector3(part.origin[0] - 0, part.origin[1] - 0.01, 0)
  if (radial.lengthSq() < 1e-12) radial.set(0, 0, 0)
  else radial.normalize()
  RADIAL[part.id] = radial
}

interface InternalsProps {
  materials: InternalsMaterialSet
  control: MutableRefObject<InternalsControl>
}

/**
 * X-ray hardware stack. Explodes as a wave (delay from assembly distance),
 * lifts the die and cell for their hero shots, dims surroundings behind
 * the subject, and blooms the cell glow at the energy climax.
 */
export function Internals({ materials, control }: InternalsProps) {
  const groups = useRef<Record<string, THREE.Group[]>>({})
  const scratch = useRef({ dir: new THREE.Vector3() })
  const register: PartRegister = useMemo(() => {
    const map: Record<string, THREE.Group[]> = {}
    groups.current = map
    return (id: string) => (g: THREE.Group | null) => {
      if (g === null) {
        delete map[id]
        return
      }
      map[id] = [...(map[id] ?? []), g]
    }
  }, [])

  useFrame(() => {
    const c = control.current
    for (const k of INTERNALS_KEYS) materials[k].opacity = c.opacity
    // Decals stay subordinate: marking low contrast, floorplan a whisper.
    materials.dieMark.opacity = c.opacity * 0.9
    materials.dieFloor.opacity = c.opacity * 0.25
    const visible = c.opacity > 0.01
    // Publish anchors for the HTML callout layer (one ref copy per frame).
    calloutBridge.anchors = groups.current
    const fan = 0.45 * c.explodeRadial
    for (const part of EXPLODE_PARTS) {
      const targets = groups.current[part.id]
      if (targets === undefined) continue
      const w = partProgress(c.explode, part.delay)
      const radial = RADIAL[part.id]
      const axial = AXIAL[part.id] ?? 1
      const dir = scratch.current.dir
      if (radial !== undefined) dir.set(radial.x * fan, radial.y * fan, axial * (1 - fan))
      else dir.set(0, 0, axial)
      dir.normalize()
      const travel = part.distance * w
      for (const g of targets) {
        g.visible = visible
        g.position.set(dir.x * travel, dir.y * travel, dir.z * travel)
        if (part.tumble !== undefined) {
          g.rotation.set(part.tumble[0] * w, part.tumble[1] * w, part.tumble[2] * w)
        }
      }
    }
    if (!visible) return

    // Act-specific lifts ride on top of the registry explode.
    const bump = (ids: string[], dz: number): void => {
      for (const id of ids) {
        for (const g of groups.current[id] ?? []) g.position.z += dz
      }
    }
    bump(['die'], c.chipLift * 0.004)
    bump(['cell', 'cell-wrap'], c.explodeBatt * 0.003 + c.battLift * 0.003)
    bump(['charge-coil'], c.explodeBatt * 0.0044)

    // Subject dim: surroundings step back while the die or cell owns the frame.
    const dim = 1 - c.subjectDim * 0.55
    materials.board.opacity = c.opacity * dim
    materials.shield.opacity = c.opacity * dim
    materials.housing.opacity = c.opacity * (c.chipFocus > 0.4 ? dim : 1)
    materials.die.emissiveIntensity = 0.7 + c.chipFocus * 1.6
    materials.cellGlow.opacity = c.opacity
    // Capped at 2.5: the authored 4.9 clipped against the 1.1 battery
    // exposure and bloomed like a video game (Prompt B section 5.3).
    materials.cellGlow.emissiveIntensity = 1 + c.energy * 1 + c.battLift * 0.5
  })

  return (
    <group>
      <BoardPart materials={materials} register={register} />
      <SiliconPart materials={materials} register={register} />
      <PowerPart materials={materials} register={register} />
      <OpticsPart materials={materials} register={register} />
    </group>
  )
}
