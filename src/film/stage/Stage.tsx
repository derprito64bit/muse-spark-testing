import { useEffect, useMemo, useRef } from 'react'
import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'
import { stageColors } from './stageColors.ts'

/**
 * The stage (Prompt D section 7, colour journey in section 8): the device
 * gets a place to be instead of floating in a void. An
 * orientation-independent room (gradient backdrop sphere with a horizon
 * value break, so it survives the film's full orbit), a matte floor, and a
 * soft contact pool. The backdrop repaints from the per-act stage colours
 * every frame from a 64x32 scratch canvas: cheap, continuous, and exactly
 * reversible on scrub.
 *
 * Cost notes: one tiny canvas upload per frame, one floor draw, one
 * ContactShadows depth pass. No real-time reflection yet (measured
 * separately per D 13.6).
 */
export function Stage({ progress }: { progress: MotionValue<number> }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 256
    const texture = new THREE.CanvasTexture(canvas)
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
  const ctx = useMemo(() => {
    const canvas = texture.image as HTMLCanvasElement
    return canvas.getContext('2d')
  }, [texture])
  const paint = useRef({ base: '#000000', top: '#000000' })

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    if (ctx === null) return
    const { base, top } = stageColors(progress.get())
    const baseCss = `#${base.getHexString()}`
    const topCss = `#${top.getHexString()}`
    const last = paint.current
    if (last.base === baseCss && last.top === topCss) return
    last.base = baseCss
    last.top = topCss
    // Canvas row 0 is v=1 (flipY), the sphere's crown.
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, topCss)
    g.addColorStop(0.42, baseCss)
    // Horizon value break at the equator: the eye orients on it. A
    // uniform gradient would read as fog, not a room.
    g.addColorStop(0.5, topCss)
    g.addColorStop(0.56, baseCss)
    g.addColorStop(0.75, '#090a0e')
    g.addColorStop(1, '#050608')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 256)
    texture.needsUpdate = true
  })

  return (
    <group name="stage">
      {/* Room: gradient shell, BackSide so the orbit never leaves it. */}
      <mesh scale={[6, 6, 6]}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Floor: matte, no specular character. A backdrop, not a subject. */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color={new THREE.Color('#14161d')} roughness={0.95} metalness={0} />
      </mesh>
      {/* Contact pool: broad occlusion, the device's weight made visible. */}
      <ContactShadows position={[0, -0.415, 0]} scale={1.4} far={0.7} blur={2.6} opacity={0.55} />
    </group>
  )
}
