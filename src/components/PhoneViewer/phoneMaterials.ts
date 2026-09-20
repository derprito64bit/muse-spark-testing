import { Color, MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from 'three'
import { FINISH_PARAMS, type FinishParams } from './phoneFinishes.ts'
import {
  createBarrelGradientMap,
  createBrushTexture,
  createCeramicMottleTexture,
  createCoatingThicknessMap,
  createLensGlossMap,
  createLogoTexture,
  createRegulatoryTexture,
  createScreenGradientTexture,
  createScreenTexture,
  createSmudgeMap,
  createSubpixelTexture,
} from './phoneTextures.ts'

export { FINISH_COLORS, FINISH_PARAMS, type FinishParams } from './phoneFinishes.ts'

export interface PhoneMaterialSet {
  /**
   * Frame rails, one instance per side. On a real extruded rail the brush
   * grain runs along each side, rotating 90 degrees at every corner, so the
   * anisotropy rotation alternates: X rails (top/bottom) run one way, Y
   * rails (left/right) the other. The corner transition is invisible at
   * 0.25mm; the two long rails finally read correctly.
   */
  framePX: MeshPhysicalMaterial
  frameNX: MeshPhysicalMaterial
  framePY: MeshPhysicalMaterial
  frameNY: MeshPhysicalMaterial
  /**
   * Machined chamfer faces. Same alloy as frame, polished smoother by the
   * tool (0.6x roughness), so the chamfer carries a tighter highlight line
   * than the rail behind it. Assigned to discrete machined parts (seat,
   * collars, flanges). Extrude bevels share their parent extrusion and
   * cannot take a separate instance without splitting the geometry.
   */
  frameChamfer: MeshPhysicalMaterial
  back: MeshPhysicalMaterial
  island: MeshPhysicalMaterial
  /** Front glass surface, reflective near-black. */
  screen: MeshPhysicalMaterial
  /** Inner emissive display panel inset behind the glass. */
  display: MeshPhysicalMaterial
  lensRing: MeshPhysicalMaterial
  /**
   * Per-lens cover glasses. Coatings are tuned per element in life: A leans
   * green, B leans magenta, C stays near neutral. Low saturation throughout.
   */
  lensGlassA: MeshPhysicalMaterial
  lensGlassB: MeshPhysicalMaterial
  lensGlassC: MeshPhysicalMaterial
  /** Machined inner barrel wall visible through the lens glass. */
  lensBarrel: MeshPhysicalMaterial
  lensCavity: MeshPhysicalMaterial
  /** Faint deep sensor reflection inside each optical assembly. */
  sensorGlint: MeshPhysicalMaterial
  button: MeshPhysicalMaterial
  focusRing: MeshPhysicalMaterial
  logo: MeshPhysicalMaterial
  /** Illegible regulatory micro-text block, present because real devices have one. */
  regulatory: MeshPhysicalMaterial
  /** Macro-only RGB stripe overlay, faded by camera distance in the shell. */
  subpixel: MeshPhysicalMaterial
  /** USB-C receptacle interior. */
  port: MeshPhysicalMaterial
  /** Receptacle tongue, lighter than the cavity walls. */
  portTongue: MeshPhysicalMaterial
  /** Contact glint strip on the tongue face. */
  portContact: MeshPhysicalMaterial
  /** Earpiece and mic openings. */
  speaker: MeshPhysicalMaterial
  /** Dark antenna separation seams. */
  antenna: MeshPhysicalMaterial
  /** SIM tray strip. */
  simTray: MeshPhysicalMaterial
  /** Flash module collar. */
  flashRing: MeshPhysicalMaterial
  /** Flash LED face. */
  flashGlass: MeshPhysicalMaterial
  /** Rangefinder cover: dark red-tinted glass. */
  rangeGlass: MeshPhysicalMaterial
}

export const MATERIAL_KEYS = [
  'framePX',
  'frameNX',
  'framePY',
  'frameNY',
  'frameChamfer',
  'back',
  'island',
  'screen',
  'display',
  'lensRing',
  'lensGlassA',
  'lensGlassB',
  'lensGlassC',
  'lensBarrel',
  'lensCavity',
  'sensorGlint',
  'button',
  'focusRing',
  'logo',
  'regulatory',
  'subpixel',
  'port',
  'portTongue',
  'portContact',
  'speaker',
  'antenna',
  'simTray',
  'flashRing',
  'flashGlass',
  'rangeGlass',
] as const satisfies ReadonlyArray<keyof PhoneMaterialSet>

/** The four rail instances, updated as one in the finish lerp. */
export const RAIL_KEYS = [
  'framePX',
  'frameNX',
  'framePY',
  'frameNY',
] as const satisfies ReadonlyArray<keyof PhoneMaterialSet>

function makeMaterial(overrides: MeshPhysicalMaterialParameters): MeshPhysicalMaterial {
  // Transparent from birth (Prompt A section 1): the x-ray opacity dissolve
  // must never trigger a mid-film shader recompile. Opacity stays 1 until
  // a director writes otherwise.
  return new MeshPhysicalMaterial({ envMapIntensity: 1, transparent: true, ...overrides })
}

/** Creates a full independent material set for one phone instance. */
export function createPhoneMaterials(params: FinishParams): PhoneMaterialSet {
  const ceramic = createCeramicMottleTexture()
  const brush = createBrushTexture()
  const lensGloss = createLensGlossMap()
  const coating = createCoatingThicknessMap()
  const barrelGradient = createBarrelGradientMap()
  const smudge = createSmudgeMap()
  // Groove period follows the finish: slate's heavy grain reads near 0.08mm,
  // obsidian's faint grain near 0.13mm.
  brush.repeat.setScalar(90 + params.grainAmplitude * 80)

  const makeRail = (anisotropyRotation: number): MeshPhysicalMaterial =>
    makeMaterial({
      color: new Color(params.frameColor),
      metalness: 1,
      roughness: params.frameRoughness,
      roughnessMap: brush,
      anisotropy: params.frameAnisotropy,
      anisotropyRotation,
      envMapIntensity: 1.2,
    })
  const framePX = makeRail(0)
  const frameNX = makeRail(0)
  const framePY = makeRail(Math.PI / 2)
  const frameNY = makeRail(Math.PI / 2)
  const frameChamfer = makeMaterial({
    color: new Color(params.frameColor),
    metalness: 1,
    roughness: params.frameRoughness * 0.6,
    roughnessMap: brush,
    anisotropy: params.frameAnisotropy,
    anisotropyRotation: Math.PI / 2,
    envMapIntensity: 1.4,
  })
  // Per-family recipes: ceramic gets clearcoat over mottle, brushed gets
  // bare metal with strong grain, glass gets hard clearcoat, anodised gets
  // sheen without clearcoat, textured gets matte grain.
  const brushed = params.family === 'brushed'
  const back = makeMaterial({
    color: new Color(params.backColor),
    metalness: params.backMetalness,
    roughness: params.backRoughness,
    roughnessMap: ceramic.data,
    map: brushed ? null : ceramic.color,
    clearcoat: params.backClearcoat,
    clearcoatRoughness: params.backClearcoatRoughness,
    sheen: params.family === 'anodised' ? 0.5 : 0,
    sheenColor: new Color(params.backColor),
    // Kept below the frame response: a matte back should hold darkness
    // under the softbox, not wash into a sticker.
    envMapIntensity: brushed ? 1.25 : 1.05,
  })
  const island = makeMaterial({
    color: new Color(params.islandColor),
    metalness: params.backMetalness,
    roughness: Math.min(0.28, params.backRoughness * 0.8),
    roughnessMap: ceramic.data,
    map: brushed ? null : ceramic.color,
    clearcoat: Math.min(1, params.backClearcoat + 0.05),
    clearcoatRoughness: Math.max(0.05, params.backClearcoatRoughness - 0.05),
    envMapIntensity: 1.2,
  })
  const screen = makeMaterial({
    color: new Color('#06080d'),
    metalness: 0,
    roughness: 0.045,
    roughnessMap: smudge,
    map: createScreenGradientTexture(),
    clearcoat: 1,
    clearcoatRoughness: 0.045,
    envMapIntensity: 0.95,
  })
  const display = makeMaterial({
    color: new Color('#02040a'),
    metalness: 0,
    roughness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    emissive: new Color('#ffffff'),
    emissiveIntensity: 1,
    envMapIntensity: 0.5,
  })
  const lensRing = makeMaterial({
    color: new Color('#c9d2de'),
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1,
  })
  const makeLensGlass = (tint: string, thickness: [number, number]): MeshPhysicalMaterial =>
    makeMaterial({
      color: new Color(tint),
      metalness: 0,
      roughness: 0.025,
      roughnessMap: lensGloss,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 0.25,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: thickness,
      iridescenceThicknessMap: coating,
      envMapIntensity: 1.9,
    })
  const lensGlassA = makeLensGlass('#0d141f', [120, 320])
  const lensGlassB = makeLensGlass('#140f1c', [200, 420])
  const lensGlassC = makeLensGlass('#0a101d', [100, 200])
  const lensBarrel = makeMaterial({
    color: new Color('#171b22'),
    metalness: 0.95,
    roughness: 0.55,
    roughnessMap: barrelGradient,
    envMapIntensity: 0.5,
  })
  const lensCavity = makeMaterial({
    color: new Color('#04060b'),
    metalness: 0,
    roughness: 0.92,
    envMapIntensity: 0.15,
  })
  const sensorGlint = makeMaterial({
    color: new Color('#2f63c8'),
    metalness: 0,
    roughness: 0.2,
    emissive: new Color('#2f63c8'),
    emissiveIntensity: 1.4,
    envMapIntensity: 0.2,
  })
  const button = makeMaterial({
    color: new Color('#99a0aa'),
    metalness: 1,
    roughness: 0.38,
    envMapIntensity: 0.9,
  })
  const focusRing = makeMaterial({
    color: new Color('#7fb4ff'),
    emissive: new Color('#7fb4ff'),
    emissiveIntensity: 2,
    metalness: 0,
    roughness: 1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  // Laser-etched, not printed: the mark takes the back colour shifted a
  // step toward white on dark finishes (toward ink on glacier), at low
  // opacity and etched roughness, so it sits in the glass.
  const backLum = new Color(params.backColor).getHSL({ h: 0, s: 0, l: 0 }).l
  const etchTarget = backLum > 0.6 ? new Color('#1a1d24') : new Color('#ffffff')
  const etchColor = new Color(params.backColor).lerp(etchTarget, 0.16)
  const logo = makeMaterial({
    color: etchColor,
    map: createLogoTexture(),
    metalness: 0,
    roughness: 0.55,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })
  const regulatory = makeMaterial({
    color: new Color('#ffffff'),
    map: createRegulatoryTexture(),
    metalness: 0,
    roughness: 1,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  })
  const subpixel = makeMaterial({
    color: new Color('#ffffff'),
    map: createSubpixelTexture(),
    metalness: 0,
    roughness: 0.4,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const port = makeMaterial({
    color: new Color('#0a0d12'),
    metalness: 0.9,
    roughness: 0.4,
    envMapIntensity: 0.5,
  })
  const portTongue = makeMaterial({
    color: new Color('#3a4048'),
    metalness: 0.7,
    roughness: 0.5,
    envMapIntensity: 0.7,
  })
  const portContact = makeMaterial({
    color: new Color('#d8b45a'),
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.2,
  })
  const speaker = makeMaterial({
    color: new Color('#05070a'),
    metalness: 0,
    roughness: 0.95,
  })
  const antenna = makeMaterial({
    color: new Color(params.antennaColor),
    metalness: 0.5,
    roughness: 0.55,
  })
  const simTray = makeMaterial({
    color: new Color('#9aa3b0'),
    metalness: 1,
    roughness: 0.35,
    envMapIntensity: 1.1,
  })
  const flashRing = makeMaterial({
    color: new Color('#2a2f38'),
    metalness: 1,
    roughness: 0.3,
    envMapIntensity: 1,
  })
  const flashGlass = makeMaterial({
    color: new Color('#eef6ff'),
    metalness: 0,
    roughness: 0.08,
    emissive: new Color('#dfeaff'),
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.9,
  })
  const rangeGlass = makeMaterial({
    color: new Color('#2a0a10'),
    metalness: 0,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: new Color('#550000'),
    emissiveIntensity: 0.4,
    envMapIntensity: 1.2,
  })

  display.emissiveMap = createScreenTexture()
  display.emissiveIntensity = 1.15

  return {
    framePX,
    frameNX,
    framePY,
    frameNY,
    frameChamfer,
    back,
    island,
    screen,
    display,
    lensRing,
    lensGlassA,
    lensGlassB,
    lensGlassC,
    lensBarrel,
    lensCavity,
    sensorGlint,
    button,
    focusRing,
    logo,
    regulatory,
    subpixel,
    port,
    portTongue,
    portContact,
    speaker,
    antenna,
    simTray,
    flashRing,
    flashGlass,
    rangeGlass,
  }
}

/** Creates the owned default material set with a static display texture. */
export function createDefaultMaterials(): PhoneMaterialSet {
  const set = createPhoneMaterials(FINISH_PARAMS.obsidian)
  const previous = set.display.emissiveMap
  set.display.emissiveMap = createScreenTexture()
  set.display.emissiveIntensity = 1.15
  if (previous !== null) previous.dispose()
  return set
}

/** Disposes every material plus its owned maps. Safe to call once per owner. */
export function disposePhoneMaterials(set: PhoneMaterialSet): void {
  const seen = new Set<string>()
  for (const key of MATERIAL_KEYS) {
    const material = set[key]
    // Walk every map slot in use, including the coating thickness map.
    // Any new slot must be added here in the same commit.
    for (const slot of [
      material.map,
      material.roughnessMap,
      material.emissiveMap,
      material.normalMap,
      material.iridescenceThicknessMap,
    ] as const) {
      if (slot !== null && !seen.has(slot.uuid)) {
        seen.add(slot.uuid)
        slot.dispose()
      }
    }
    material.dispose()
  }
}
