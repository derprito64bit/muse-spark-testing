import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { centerBias, fitFov, macroFloorFov } from './framing.ts'
import { SHOTS, capAngularStep } from './shots.ts'
import { STAGE_LIGHTING } from './lighting.ts'
import { clearInspectPointer, setInspectPointer, tickInspect } from './inspect.ts'
import type { ScreenMode } from './LiveScreen.tsx'
import { computeFilmStates, layerWindow } from './states.ts'
import { actAt } from './timeline.ts'
import {
  FEATURE_OFFSET,
  FLIP,
  LAYER_GAP,
  LAYER_GAP_COMPACT,
  TEARDOWN_LAYERS,
  featureFrame,
  layerOffset,
  weightDamp,
  type FeatureFrame,
} from './teardown/layers.ts'
import { sampleFilm } from './sample.ts'
import { dollyZoomFov } from '../zoom/zoom.ts'
import type { PhoneMaterialSet } from '../components/PhoneViewer/phoneMaterials.ts'
import type { InternalsControl } from './internals/Internals.tsx'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/** Shell materials that dissolve together when the internals take over. */
const SHELL_MATS = [
  'framePX',
  'frameNX',
  'framePY',
  'frameNY',
  'frameChamfer',
  'back',
  'island',
  'lensRing',
  'lensGlassA',
  'lensGlassB',
  'lensGlassC',
  'lensBarrel',
  'lensCavity',
  'sensorGlint',
  'collarOuter',
  'collarTop',
  'knurlWall',
  'collarStep',
  'glassSeal',
  'moduleGlass',
  'medallion',
  'medallionRing',
  'periscopeGlass',
  'periscopePrism',
  'flashArc',
  'flashDiffuser',
  'tofWindow',
  'tofEmitter',
  'tofReceiver',
  'tofHousing',
  'moduleMic',
  'bezel',
  'panelLower',
  'panelSeam',
  'antenna',
  'simTray',
  'port',
  'portTongue',
  'portContact',
  'speaker',
  'button',
  'logo',
  'regulatory',
  'focusRing',
  'flashGlass',
] as const satisfies ReadonlyArray<keyof PhoneMaterialSet>

/** Bezel and edge hardware dials out harder so it never paints over internals. */
const FRAME_MATS = [
  'framePX',
  'frameNX',
  'framePY',
  'frameNY',
  'frameChamfer',
  'button',
  'simTray',
  'port',
  'portTongue',
  'portContact',
  'speaker',
  'antenna',
] as const

const XRAY_ACTS = new Set(['teardown'])

/** Rest opacity for translucent optics. Everything else rests at 1. */
const BASE_OPACITY: Partial<Record<keyof PhoneMaterialSet, number>> = {
  lensGlassA: 0.55,
  lensGlassB: 0.55,
  lensGlassC: 0.55,
  moduleGlass: 0.5,
  periscopeGlass: 0.4,
  flashDiffuser: 0.75,
  tofWindow: 0.88,
  focusRing: 0,
}

/**
 * Translucent optics never write depth: with depthWrite forced true, the
 * glass bricks over everything behind it (barrels, baffles, medallion,
 * ToF internals all vanish and lenses read as dark stickers).
 */
const NO_DEPTH_WRITE: ReadonlySet<string> = new Set([
  'lensGlassA',
  'lensGlassB',
  'lensGlassC',
  'moduleGlass',
  'periscopeGlass',
  'flashDiffuser',
  'tofWindow',
])

/**
 * Context recede map (Prompt D section 5.1): shell materials per teardown
 * layer. Unfeatured layers step back to 45% over the ghost dissolve while
 * the featured layer keeps its rest opacity. Internals share materials
 * across layers, so the pop there comes from the accent light and motion
 * instead (documented in docs/teardown.md).
 */
const RECEDE_MATS: Partial<Record<string, ReadonlyArray<keyof PhoneMaterialSet>>> = {
  'cover-glass': ['screen'],
  display: ['display', 'bezel'],
  midframe: ['framePX', 'frameNX', 'framePY', 'frameNY', 'frameChamfer', 'button'],
  'rear-panel': ['back', 'logo', 'regulatory', 'panelLower', 'panelSeam'],
  camera: [
    'island',
    'lensRing',
    'lensGlassA',
    'lensGlassB',
    'lensGlassC',
    'lensBarrel',
    'lensCavity',
    'sensorGlint',
    'collarOuter',
    'collarTop',
    'knurlWall',
    'collarStep',
    'glassSeal',
    'moduleGlass',
    'medallion',
    'medallionRing',
    'periscopeGlass',
    'periscopePrism',
    'flashArc',
    'flashDiffuser',
    'tofWindow',
    'tofEmitter',
    'tofReceiver',
    'tofHousing',
    'moduleMic',
  ],
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

export interface FilmRefs {
  hero: MutableRefObject<THREE.Group | null>
  frame: MutableRefObject<THREE.Group | null>
  back: MutableRefObject<THREE.Group | null>
  glass: MutableRefObject<THREE.Group | null>
  display: MutableRefObject<THREE.Group | null>
  module: MutableRefObject<THREE.Group | null>
  internals: MutableRefObject<THREE.Group | null>
  internalsControl: MutableRefObject<InternalsControl>
  keyLight: MutableRefObject<THREE.DirectionalLight | null>
  fillLight: MutableRefObject<THREE.DirectionalLight | null>
  rimLight: MutableRefObject<THREE.DirectionalLight | null>
  accentLight: MutableRefObject<THREE.DirectionalLight | null>
  opticsSeparation: MutableRefObject<Record<string, THREE.Group | null>>
  screenMode: { current: ScreenMode }
  screenBrightness: { current: number }
  parallaxX: MotionValue<number>
  parallaxY: MotionValue<number>
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
    camPos: new THREE.Vector3(0, 0, 0.62),
    camReady: false,
    env: 0.9,
    key: 2.2,
    fill: 0.7,
    rim: 1.1,
    accent: 0,
    tint: new THREE.Color('#ffffff'),
    tintTarget: new THREE.Color('#ffffff'),
    accentTarget: new THREE.Color('#ffffff'),
    teardown: { detach: 0, turn: 0, scale: 0 } as FeatureFrame,
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

    const shot = SHOTS[act] ?? SHOTS.arrival
    const damp = reduced ? 1 : 1 - Math.exp(-delta * shot.dampPerSecond)
    const lookDamp = reduced ? 1 : 1 - Math.exp(-delta * shot.targetDampPerSecond)
    const capRot = (current: number, goal: number): number =>
      reduced ? goal : capAngularStep(current, goal, shot.maxAngularVelocity, delta)

    const cam = state.camera as THREE.PerspectiveCamera
    // Position glides: a hard flick through a fast move (battery exit runs
    // 0.2m in 0.006 of progress) travels instead of teleporting. Tracks
    // smooth scroll invisibly at 7/s; snaps under reduced motion.
    if (reduced || !s.camReady) {
      s.camPos.copy(t.pos)
      s.camReady = true
      cam.position.copy(t.pos)
    } else {
      const pd = 1 - Math.exp(-delta * 7)
      s.camPos.x += (t.pos.x - s.camPos.x) * pd
      s.camPos.y += (t.pos.y - s.camPos.y) * pd
      s.camPos.z += (t.pos.z - s.camPos.z) * pd
      cam.position.copy(s.camPos)
    }
    // Aim settles late: damped slower than pose so the eye leads.
    s.look.x += (t.target.x - s.look.x) * lookDamp
    s.look.y += (t.target.y - s.look.y) * lookDamp
    s.look.z += (t.target.z - s.look.z) * lookDamp
    // Pointer parallax: small clamped offset applied at lookAt time, never
    // stored, so it cannot accumulate inside the damped aim.
    let lookX = s.look.x
    let lookY = s.look.y
    if (!reduced) {
      lookX += THREE.MathUtils.clamp(refs.parallaxX.get(), -0.5, 0.5) * 0.016
      lookY += THREE.MathUtils.clamp(refs.parallaxY.get(), -0.5, 0.5) * 0.012
    }
    cam.lookAt(lookX, lookY, s.look.z)

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
        // Damped toward the sampled pose, then capped: a hard flick gets a
        // fast controlled move, never a whip (Prompt B section 7.2).
        g.rotation.x = capRot(g.rotation.x, g.rotation.x + (t.rx - g.rotation.x) * damp)
        g.rotation.y = capRot(g.rotation.y, g.rotation.y + (t.ry - g.rotation.y) * damp)
        g.rotation.z = capRot(g.rotation.z, g.rotation.z + (t.rz - g.rotation.z) * damp)
        const ns = t.scale
        g.scale.x += (ns - g.scale.x) * damp
        g.scale.y += (ns - g.scale.y) * damp
        g.scale.z += (ns - g.scale.z) * damp
        g.position.x += (px - g.position.x) * damp
        g.position.y += (py - g.position.y) * damp
      }
      // Internals ride the hero transform exactly: without this lock the
      // exploded parts sit in unrotated space while the shell turns, which
      // reads as parts scattered everywhere. Copies the damped values, so
      // the lock itself can never pop or desync on reverse scrub.
      const ig = refs.internals.current
      if (ig !== null) {
        ig.position.copy(g.position)
        ig.quaternion.copy(g.quaternion)
        ig.scale.copy(g.scale)
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
    // Vertigo once, on the silicon feature: widen the lens while the camera
    // pushes in so the die holds size and the background warps. Used once;
    // twice would be a gimmick. Derived from the layer cursor, not raw
    // progress, so the beat tracks layer 5 (round 01 A3).
    if (!reduced) {
      const w = layerWindow(st.layerCursor, 5, 0.5, 0.5)
      if (w > 0) {
        targetFov += (dollyZoomFov(targetFov, w * 0.12, distance) - targetFov) * w
      }
    }
    if (reduced) {
      if (Math.abs(cam.fov - targetFov) > 0.001) {
        cam.fov = targetFov
        cam.updateProjectionMatrix()
      }
    } else if (Math.abs(cam.fov - targetFov) > 0.01) {
      const damped = cam.fov + (targetFov - cam.fov) * (1 - Math.exp(-delta * 7))
      cam.fov = capAngularStep(cam.fov, damped, shot.maxFovVelocity, delta)
      cam.updateProjectionMatrix()
    }

    // X-ray dissolve: shell fades together, front glass merely dims.
    // Translucent optics keep their base opacity (they are glass, not
    // shutters): stomping them to 1 would brick over the barrels, the
    // medallion, and the ToF internals behind them.
    const ghost = st.shellGhost > 0.01
    for (const name of SHELL_MATS) {
      const mat = materials[name]
      mat.depthWrite = NO_DEPTH_WRITE.has(name) ? false : !ghost
      const base = BASE_OPACITY[name] ?? 1
      mat.opacity = ghost ? Math.max(0.02, base - st.shellGhost * 0.9) : base
    }
    if (ghost) {
      // While the teardown stack is separated, RECEDE_MATS owns the midframe
      // (round 01 A3): the retired chipFocus term pinned the frame shut
      // through the silicon beat and fought the teardown driver over it.
      const chipDim = st.stackSeparate > 0.001 ? 0 : st.chipFocus * 0.8
      const frameAlpha = Math.max(0.02, 1 - st.shellGhost * 0.9 - chipDim - st.cameraFocus * 0.5)
      for (const name of FRAME_MATS) materials[name].opacity = frameAlpha
      if (refs.frame.current !== null) {
        refs.frame.current.visible = !(frameAlpha <= 0.05 && st.chipFocus > 0.4)
      }
    } else if (refs.frame.current !== null && !refs.frame.current.visible) {
      refs.frame.current.visible = true
    }
    const split = st.shellSplit
    // The teardown driver owns shell groups while stacked; the legacy
    // split resumes as separation returns to zero. Both converge near
    // zero at the handoff, so no snap either way.
    if (st.stackSeparate <= 0.001) {
      if (refs.glass.current !== null) refs.glass.current.position.z = split * 0.0045
      if (refs.back.current !== null) refs.back.current.position.z = -split * 0.0036
    }
    materials.display.opacity = Math.max(0.02, 1 - st.shellGhost * 0.95)
    // Glass tracks power state: a dark mirror when off, dimmed to reveal
    // the live screen when on, dissolved with the shell in x-ray. A flat
    // 0.42 washed every off-screen act gray.
    materials.screen.opacity = Math.max(0.05, 1 - st.screenOn * 0.58 - st.shellGhost * 0.36)

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
    // Macro atmosphere lifts the sensor shimmer at the holds. The featured
    // camera layer lifts it further so the featured part pops.
    const featuredCamera =
      st.stackSeparate > 0.001 && st.layerCursor > 7.02 && st.layerCursor < 8.99 ? 1 : 0
    materials.sensorGlint.emissiveIntensity = 1.4 + st.macroAtmos * 0.8 + featuredCamera

    // Lighting state damped per act.
    const light = STAGE_LIGHTING[act] ?? STAGE_LIGHTING.arrival
    const ld = reduced ? 1 : 1 - Math.exp(-delta * 5)
    s.key += (light.key - s.key) * ld
    s.fill += (light.fill - s.fill) * ld
    s.rim += (light.rim - s.rim) * ld
    s.env += (light.env - s.env) * ld
    // Camera-act accent rakes the collar chamfer; elsewhere it rests at zero.
    // Focus pulls borrow it briefly so the subject owns the light.
    s.accent += ((act === 'camera' ? 1.6 : 0) + st.focusPull * 0.8 - s.accent) * ld
    s.tint.lerp(s.tintTarget.set(light.envTint), ld)
    if (refs.keyLight.current !== null) refs.keyLight.current.intensity = s.key
    if (refs.fillLight.current !== null) refs.fillLight.current.intensity = s.fill
    if (refs.rimLight.current !== null) refs.rimLight.current.intensity = s.rim
    if (refs.accentLight.current !== null) {
      refs.accentLight.current.intensity = s.accent
      refs.accentLight.current.color.copy(s.tint)
    }
    for (const name of [
      'framePX',
      'frameNX',
      'framePY',
      'frameNY',
      'frameChamfer',
      'back',
      'island',
      'collarOuter',
    ] as const) {
      materials[name].envMapIntensity = s.env
    }
    state.gl.toneMappingExposure = t.exposure * light.exposure

    // Optical separation: cover, collar, barrel, element, sensor open in
    // sequence over the optics beat (Prompt B section 5.2). Outward is -z.
    // Tight breathing, not detachment: at macro scale 2.2mm of cover travel
    // reads as a part floating off into space, so the stack stays laced.
    const layers = [
      ['cover', 0, 0.0012],
      ['collar', 0.15, 0.001],
      ['barrel', 0.3, 0.0007],
      ['element', 0.45, 0.0004],
      ['sensor', 0.6, 0.0002],
    ] as const
    const sep = st.explodeOptics
    for (const lens of ['main', 'ultra', 'mid', 'periscope'] as const) {
      for (const [layer, delay, distance] of layers) {
        const g = refs.opticsSeparation.current[`${lens}:${layer}`]
        if (g === null || g === undefined) continue
        const t = Math.min(1, Math.max(0, (sep - delay) / (1 - delay)))
        g.position.z = -distance * (t * t * (3 - 2 * t))
      }
    }

    // Internals control plane.
    const c = refs.internalsControl.current
    c.opacity = st.internalOpacity
    c.explode = st.explodeXray
    c.explodeBatt = st.explodeBatt
    c.explodeRadial = st.explodeRadial
    c.chipFocus = st.chipFocus
    c.chipLift = st.chipLift
    c.battLift = st.battLift
    c.subjectDim = st.subjectDim
    c.energy = st.energy
    c.shieldLift = st.shieldLift
    c.coilRing = st.coilRing
    c.stackSeparate = st.stackSeparate
    c.layerCursor = st.layerCursor
    c.teardownGap = state.size.width < 900 ? LAYER_GAP_COMPACT : LAYER_GAP
    c.reducedMotion = reduced

    // Teardown layer driver (Prompt D sections 4-5): shell groups ride
    // their layer slots plus the four-phase feature gesture, damped by
    // weight class. The module nests inside back, so its goal is relative
    // to keep its world offset on its own layer.
    const teardownSep = st.stackSeparate
    if (teardownSep > 0.001) {
      const cursor = st.layerCursor
      const featured = cursor > 0.02 && cursor < 9.99 ? Math.min(9, Math.floor(cursor)) : -1
      for (const layer of TEARDOWN_LAYERS) {
        featureFrame(clamp01(cursor - layer.index), layer.weight, s.teardown, reduced)
        const f = s.teardown
        const off = layerOffset(layer.index, 10, c.teardownGap, teardownSep)
        const damp = reduced ? 1 : 1 - Math.exp(-delta * weightDamp(layer.weight))
        for (const name of layer.shell) {
          const grp =
            name === 'frame'
              ? refs.frame.current
              : name === 'back'
                ? refs.back.current
                : name === 'glass'
                  ? refs.glass.current
                  : name === 'display'
                    ? refs.display.current
                    : refs.module.current
          if (grp === null) continue
          const base =
            name === 'module'
              ? layerOffset(8, 10, c.teardownGap, teardownSep) -
                layerOffset(9, 10, c.teardownGap, teardownSep)
              : off
          grp.position.x += (FEATURE_OFFSET.x * f.detach - grp.position.x) * damp
          grp.position.y += (FEATURE_OFFSET.y * f.detach - grp.position.y) * damp
          grp.position.z += (base + FEATURE_OFFSET.z * f.detach - grp.position.z) * damp
          grp.rotation.set(FLIP.x * f.turn, FLIP.y * f.turn, FLIP.z * f.turn)
          // Compact viewports shrink the hero bump so the layer never crops.
          const bump = (layer.featureScale - 1) * f.scale * (c.teardownGap < 0.008 ? 0.85 : 1)
          grp.scale.setScalar(1 + bump)
        }
      }
      // Context recede over the ghost dissolve; featured keeps rest opacity.
      for (const layer of TEARDOWN_LAYERS) {
        const mats = RECEDE_MATS[layer.id]
        if (mats === undefined) continue
        const dim = layer.index === featured ? 1 : 1 - 0.55 * st.contextRecede
        for (const m of mats) {
          const base = BASE_OPACITY[m] ?? 1
          materials[m].opacity = ghost
            ? Math.max(0.02, base - st.shellGhost * 0.9) * dim
            : base * dim
        }
      }
      // Feature accent on the rim light; the overlay kicker matches.
      if (featured >= 0 && refs.accentLight.current !== null) {
        s.accentTarget.set(TEARDOWN_LAYERS[featured]?.accent ?? '#ffffff')
        refs.accentLight.current.color.lerp(s.accentTarget, Math.min(1, delta * 5))
        refs.accentLight.current.intensity +=
          (1.4 - refs.accentLight.current.intensity) * Math.min(1, delta * 5)
      }
      if (refs.frame.current !== null) refs.frame.current.visible = true
    } else {
      // No legacy writer owns frame, display, or module: park them exactly.
      for (const grp of [refs.frame.current, refs.display.current, refs.module.current]) {
        if (grp === null) continue
        grp.position.set(0, 0, 0)
        grp.rotation.set(0, 0, 0)
        grp.scale.setScalar(1)
      }
    }

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
