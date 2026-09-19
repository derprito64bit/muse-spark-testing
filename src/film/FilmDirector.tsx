import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { centerBias, fitFov, macroFloorFov } from './framing.ts'
import { STAGE_LIGHTING } from './lighting.ts'
import { clearInspectPointer, setInspectPointer, tickInspect } from './inspect.ts'
import type { ScreenMode } from './LiveScreen.tsx'
import { computeFilmStates } from './states.ts'
import { actAt } from './timeline.ts'
import { sampleFilm } from './sample.ts'
import type { PhoneMaterialSet } from '../components/PhoneViewer/phoneMaterials.ts'
import type { InternalsControl } from './internals/Internals.tsx'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/** Shell materials that dissolve together when the internals take over. */
const SHELL_MATS = [
  'frame',
  'back',
  'island',
  'lensRing',
  'lensGlass',
  'lensBarrel',
  'lensCavity',
  'sensorGlint',
  'flashRing',
  'flashGlass',
  'antenna',
  'simTray',
  'port',
  'speaker',
  'button',
  'logo',
  'focusRing',
] as const satisfies ReadonlyArray<keyof PhoneMaterialSet>

/** Bezel and edge hardware dials out harder so it never paints over internals. */
const FRAME_MATS = ['frame', 'button', 'simTray', 'port', 'speaker', 'antenna'] as const

const XRAY_ACTS = new Set(['xray', 'rebuild'])

export interface FilmRefs {
  hero: MutableRefObject<THREE.Group | null>
  frame: MutableRefObject<THREE.Group | null>
  back: MutableRefObject<THREE.Group | null>
  glass: MutableRefObject<THREE.Group | null>
  internals: MutableRefObject<THREE.Group | null>
  internalsControl: MutableRefObject<InternalsControl>
  keyLight: MutableRefObject<THREE.DirectionalLight | null>
  fillLight: MutableRefObject<THREE.DirectionalLight | null>
  rimLight: MutableRefObject<THREE.DirectionalLight | null>
  screenMode: { current: ScreenMode }
  screenBrightness: { current: number }
}

interface FilmDirectorProps {
  progress: MotionValue<number>
  materials: PhoneMaterialSet
  refs: FilmRefs
}

/**
 * Single frame director: samples the master timeline, then writes camera,
 * pose, responsive FOV, x-ray dissolve, screen, internals, and lighting
 * without any React render. MotionValues and refs only.
 */
export function FilmDirector({ progress, materials, refs }: FilmDirectorProps) {
  const scratch = useRef({
    look: new THREE.Vector3(),
    env: 0.9,
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    prepared: false,
  })

  useFrame((state, delta) => {
    const s = scratch.current
    if (!s.prepared) {
      s.prepared = true
      for (const name of SHELL_MATS) {
        materials[name].transparent = true
      }
    }
    const reduced = window.matchMedia(REDUCED_QUERY).matches
    const p = progress.get()
    const t = sampleFilm(p)
    const st = computeFilmStates(p)
    const act = actAt(p).id

    const cam = state.camera as THREE.PerspectiveCamera
    cam.position.copy(t.pos)
    s.look.copy(t.target)
    cam.lookAt(s.look)

    const damp = reduced ? 1 : 1 - Math.exp(-delta * 7)
    const aspect = state.size.width / Math.max(1, state.size.height)
    const bx = centerBias(aspect, 'x')
    const by = centerBias(aspect, 'y')
    const px = t.fit !== null ? t.px * bx : t.px
    const py = t.fit !== null ? t.py * by : t.py

    const g = refs.hero.current
    if (g !== null) {
      if (reduced) {
        g.rotation.set(t.rx, t.ry, t.rz)
        g.scale.setScalar(t.scale)
        g.position.set(px, py, 0)
      } else {
        g.rotation.x += (t.rx - g.rotation.x) * damp
        g.rotation.y += (t.ry - g.rotation.y) * damp
        g.rotation.z += (t.rz - g.rotation.z) * damp
        const ns = t.scale
        g.scale.x += (ns - g.scale.x) * damp
        g.scale.y += (ns - g.scale.y) * damp
        g.scale.z += (ns - g.scale.z) * damp
        g.position.x += (px - g.position.x) * damp
        g.position.y += (py - g.position.y) * damp
      }
    }

    const distance = cam.position.distanceTo(s.look)
    let targetFov = t.fov
    if (t.fit !== null) {
      const fitValue = fitFov({
        fit: t.fit,
        distanceM: distance,
        aspect,
        scale: t.scale,
        rxRad: t.rx,
        ryRad: t.ry,
        pxM: t.px,
        maxFovDeg: t.fovMax,
      })
      const w = Math.min(1, Math.max(0, t.fit))
      targetFov = Math.min(t.fovMax, t.fov + (fitValue - t.fov) * w)
    }
    if (aspect < 0.8) {
      const floor = macroFloorFov(p, distance, aspect)
      if (floor > targetFov) targetFov = floor
    }
    if (reduced) {
      if (Math.abs(cam.fov - targetFov) > 0.001) {
        cam.fov = targetFov
        cam.updateProjectionMatrix()
      }
    } else if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-delta * 7))
      cam.updateProjectionMatrix()
    }

    // X-ray dissolve: shell fades together, front glass merely dims.
    const ghost = st.shellGhost > 0.01
    for (const name of SHELL_MATS) {
      const mat = materials[name]
      mat.depthWrite = !ghost
      mat.opacity = ghost ? Math.max(0.02, 1 - st.shellGhost * 0.9) : 1
    }
    if (ghost) {
      const frameAlpha = Math.max(
        0.02,
        1 - st.shellGhost * 0.9 - st.chipFocus * 0.8 - st.cameraFocus * 0.5,
      )
      for (const name of FRAME_MATS) materials[name].opacity = frameAlpha
      if (refs.frame.current !== null) {
        refs.frame.current.visible = !(frameAlpha <= 0.05 && st.chipFocus > 0.4)
      }
    } else if (refs.frame.current !== null && !refs.frame.current.visible) {
      refs.frame.current.visible = true
    }
    const split = st.shellSplit
    if (refs.glass.current !== null) refs.glass.current.position.z = split * 0.0045
    if (refs.back.current !== null) refs.back.current.position.z = -split * 0.0036
    materials.display.opacity = Math.max(0.02, 1 - st.shellGhost * 0.95)
    materials.screen.opacity = Math.max(0.05, 0.42 - st.shellGhost * 0.36)

    // Live screen mode per act.
    const mode: ScreenMode =
      st.screenOn <= 0.01
        ? 'off'
        : act === 'software'
          ? 'os'
          : act === 'camera'
            ? 'viewfinder'
            : act === 'ai'
              ? 'ai'
              : p < 0.08
                ? 'boot'
                : 'wallpaper'
    refs.screenMode.current = mode
    refs.screenBrightness.current = act === 'display' ? 0.85 : 0.6
    const dim = 1 - st.shellGhost * 0.75
    materials.display.emissiveIntensity = st.screenOn * dim * (act === 'display' ? 1.35 : 0.95)

    // Lighting state damped per act.
    const light = STAGE_LIGHTING[act] ?? STAGE_LIGHTING.arrival
    const ld = reduced ? 1 : 1 - Math.exp(-delta * 5)
    s.key += (light.key - s.key) * ld
    s.fill += (light.fill - s.fill) * ld
    s.rim += (light.rim - s.rim) * ld
    s.env += (light.env - s.env) * ld
    if (refs.keyLight.current !== null) refs.keyLight.current.intensity = s.key
    if (refs.fillLight.current !== null) refs.fillLight.current.intensity = s.fill
    if (refs.rimLight.current !== null) refs.rimLight.current.intensity = s.rim
    for (const name of ['frame', 'back', 'island', 'flashRing'] as const) {
      materials[name].envMapIntensity = s.env
    }
    state.gl.toneMappingExposure = t.exposure * light.exposure

    // Internals control plane.
    const c = refs.internalsControl.current
    c.opacity = st.internalOpacity
    c.explode = st.explodeXray
    c.explodeBatt = st.explodeBatt
    c.chipFocus = st.chipFocus
    c.chipLift = st.chipLift
    c.battLift = st.battLift
    c.subjectDim = st.subjectDim
    c.energy = st.energy

    // Hover inspection during the x-ray pass only.
    if (XRAY_ACTS.has(act) && !reduced && refs.internals.current !== null) {
      tickInspect(performance.now(), cam, refs.internals.current)
    } else {
      clearInspectPointer()
    }
  })

  return null
}

export { setInspectPointer, clearInspectPointer }
