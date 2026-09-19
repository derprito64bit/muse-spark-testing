import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { AdaptiveDpr } from '../components/PhoneViewer/PhoneCanvas.tsx'
import { PhoneConfigProvider } from '../components/PhoneViewer/PhoneConfig.tsx'
import { PhoneModel } from '../components/PhoneViewer/PhoneModel.tsx'
import {
  FINISH_PARAMS,
  createPhoneMaterials,
  type PhoneMaterialSet,
} from '../components/PhoneViewer/phoneMaterials.ts'
import { FilmDirector, type FilmRefs } from './FilmDirector.tsx'
import { Internals, type InternalsControl } from './internals/Internals.tsx'
import { createInternalsMaterials } from './internals/internalsMaterials.ts'
import { LiveScreen, useScreenRefs } from './LiveScreen.tsx'
import type { MotionValue } from 'motion/react'

interface FilmSceneProps {
  progress: MotionValue<number>
  label: string
}

/**
 * Film stage contents. Owns the film material set (x-ray isolation from
 * product viewers), the internals registry, the live screen texture, and
 * every ref the director writes. Explicit color: ACES Filmic tone mapping
 * on the Canvas, sRGB-authored colors converted once at creation.
 */
export function FilmScene({ progress, label }: FilmSceneProps) {
  const materials = useMemo<PhoneMaterialSet>(
    () => createPhoneMaterials(FINISH_PARAMS.obsidian),
    [],
  )
  const internalsMaterials = useMemo(() => createInternalsMaterials(), [])
  const screenTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(
      (() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 512
        return canvas
      })(),
    )
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  const hero = useRef<THREE.Group | null>(null)
  const frame = useRef<THREE.Group | null>(null)
  const back = useRef<THREE.Group | null>(null)
  const glass = useRef<THREE.Group | null>(null)
  const internals = useRef<THREE.Group | null>(null)
  const keyLight = useRef<THREE.DirectionalLight | null>(null)
  const fillLight = useRef<THREE.DirectionalLight | null>(null)
  const rimLight = useRef<THREE.DirectionalLight | null>(null)
  const internalsControl = useRef<InternalsControl>({
    opacity: 0,
    explode: 0,
    explodeBatt: 0,
    chipFocus: 0,
    chipLift: 0,
    battLift: 0,
    subjectDim: 0,
    energy: 0,
  })
  const screen = useScreenRefs()

  // Bind the live screen texture as the display emissive map once.
  useEffect(() => {
    const previous = materials.display.emissiveMap
    materials.display.emissiveMap = screenTexture
    materials.display.emissiveIntensity = 1
    materials.display.needsUpdate = true
    return () => {
      materials.display.emissiveMap = previous
      materials.display.needsUpdate = true
    }
  }, [materials, screenTexture])

  const refs = useMemo<FilmRefs>(
    () => ({
      hero,
      frame,
      back,
      glass,
      internals,
      internalsControl,
      keyLight,
      fillLight,
      rimLight,
      screenMode: screen.modeRef,
      screenBrightness: screen.brightnessRef,
    }),
    [screen.modeRef, screen.brightnessRef],
  )

  return (
    <group aria-label={label}>
      <directionalLight ref={keyLight} position={[0.6, 0.9, 1.2]} intensity={2.2} color="#ffffff" />
      <directionalLight
        ref={fillLight}
        position={[-0.9, 0.2, 0.6]}
        intensity={0.7}
        color="#bcd2ff"
      />
      <directionalLight
        ref={rimLight}
        position={[-0.3, -0.6, -1]}
        intensity={1.1}
        color="#7fb4ff"
      />
      <ambientLight intensity={0.35} color="#dfe8ff" />
      <group ref={hero}>
        <PhoneConfigProvider>
          <PhoneModel
            materials={materials}
            groups={{ frame, back, glass }}
            animateFocusRing={false}
          />
        </PhoneConfigProvider>
      </group>
      <group ref={internals}>
        <Internals materials={internalsMaterials} control={internalsControl} />
      </group>
      <LiveScreen
        texture={screenTexture}
        modeRef={screen.modeRef}
        brightnessRef={screen.brightnessRef}
        runningRef={screen.runningRef}
      />
      <AdaptiveDpr cap={1.75} />
      <FilmDirector progress={progress} materials={materials} refs={refs} />
    </group>
  )
}
