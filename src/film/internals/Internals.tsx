import { useFrame } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { INTERNALS_KEYS, type InternalsMaterialSet } from './internalsMaterials.ts'
import { BoardPart } from './parts/board.tsx'
import { OpticsPart } from './parts/optics.tsx'
import { PowerPart } from './parts/power.tsx'
import { SiliconPart } from './parts/silicon.tsx'

/** Mutable per-frame control plane. Written by the director, read here. No React renders. */
export interface InternalsControl {
  opacity: number
  explode: number
  explodeBatt: number
  chipFocus: number
  chipLift: number
  battLift: number
  subjectDim: number
  energy: number
}

/** Stagger distances in meters, derived from distance from assembly center. */
const BOARD_SPREAD = 0.0012
const OPTICS_SPREAD = 0.0028
const CELL_SEPARATE = 0.006

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
  const board = useRef<THREE.Group>(null)
  const silicon = useRef<THREE.Group>(null)
  const power = useRef<THREE.Group>(null)
  const optics = useRef<THREE.Group>(null)

  useFrame(() => {
    const c = control.current
    for (const k of INTERNALS_KEYS) materials[k].opacity = c.opacity
    const visible = c.opacity > 0.01
    for (const g of [board.current, silicon.current, power.current, optics.current]) {
      if (g !== null) g.visible = visible
    }
    if (!visible) return

    // Staggered wave: optics travel furthest, board barely parts.
    if (board.current !== null) board.current.position.z = c.explode * BOARD_SPREAD * 0.4
    if (optics.current !== null) optics.current.position.z = -c.explode * OPTICS_SPREAD
    if (power.current !== null) {
      power.current.position.z = c.explode * BOARD_SPREAD + c.explodeBatt * CELL_SEPARATE * 0.5
    }
    if (silicon.current !== null) {
      silicon.current.position.z = c.explode * BOARD_SPREAD * 0.7 + c.chipLift * 0.004
    }
    // Battery-only separation for the energy climax window.
    if (power.current !== null && c.explodeBatt > 0) {
      power.current.position.z += c.explodeBatt * CELL_SEPARATE * 0.5
    }
    if (silicon.current !== null && c.battLift > 0) {
      silicon.current.position.z -= c.battLift * 0.002
    }

    // Subject dim: surroundings step back while the die or cell owns the frame.
    const dim = 1 - c.subjectDim * 0.55
    materials.board.opacity = c.opacity * dim
    materials.shield.opacity = c.opacity * dim
    materials.housing.opacity = c.opacity * (c.chipFocus > 0.4 ? dim : 1)
    materials.die.emissiveIntensity = 0.7 + c.chipFocus * 1.6
    materials.cellGlow.opacity = c.opacity
    materials.cellGlow.emissiveIntensity = 1.2 + c.energy * 2.2 + c.battLift * 1.5
  })

  return (
    <group>
      <group ref={board}>
        <BoardPart materials={materials} />
      </group>
      <group ref={silicon}>
        <SiliconPart materials={materials} />
      </group>
      <group ref={power}>
        <PowerPart materials={materials} />
      </group>
      <group ref={optics}>
        <OpticsPart materials={materials} />
      </group>
    </group>
  )
}
