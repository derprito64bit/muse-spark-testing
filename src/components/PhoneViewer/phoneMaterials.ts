import { Color, MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from 'three'
import type { FinishId } from '../../data/product.ts'
import {
  createBrushTexture,
  createCeramicMottleTexture,
  createLensGlossMap,
  createLogoTexture,
  createScreenTexture,
} from './phoneTextures.ts'

/** Visual parameters per finish. Colors are lerped live by the model rig. */
export interface FinishParams {
  key: FinishId
  backColor: string
  backMetalness: number
  backRoughness: number
  islandColor: string
  frameColor: string
  frameRoughness: number
  frameAnisotropy: number
}

/** Pre-minted colors used for per-frame finish lerping without allocation. */
export const FINISH_COLORS: Record<FinishId, { frame: Color; back: Color; island: Color }> = {
  obsidian: {
    frame: new Color('#7a8089'),
    back: new Color('#0d0d11'),
    island: new Color('#0f0f14'),
  },
  titanium: {
    frame: new Color('#b5bcc7'),
    back: new Color('#a9b0bc'),
    island: new Color('#b6bdc9'),
  },
  glacier: {
    frame: new Color('#acb8cd'),
    back: new Color('#e6ecf5'),
    island: new Color('#edf2f9'),
  },
}

export const FINISH_PARAMS: Record<FinishId, FinishParams> = {
  obsidian: {
    key: 'obsidian',
    backColor: '#0d0d11',
    backMetalness: 0,
    backRoughness: 0.34,
    islandColor: '#0f0f14',
    frameColor: '#7a8089',
    frameRoughness: 0.3,
    frameAnisotropy: 0.55,
  },
  titanium: {
    key: 'titanium',
    backColor: '#a9b0bc',
    backMetalness: 1,
    backRoughness: 0.34,
    islandColor: '#b6bdc9',
    frameColor: '#b5bcc7',
    frameRoughness: 0.3,
    frameAnisotropy: 0.7,
  },
  glacier: {
    key: 'glacier',
    backColor: '#e6ecf5',
    backMetalness: 0,
    backRoughness: 0.32,
    islandColor: '#edf2f9',
    frameColor: '#acb8cd',
    frameRoughness: 0.3,
    frameAnisotropy: 0.45,
  },
}

export interface PhoneMaterialSet {
  frame: MeshPhysicalMaterial
  back: MeshPhysicalMaterial
  island: MeshPhysicalMaterial
  /** Front glass surface, reflective near-black. */
  screen: MeshPhysicalMaterial
  /** Inner emissive display panel inset behind the glass. */
  display: MeshPhysicalMaterial
  lensRing: MeshPhysicalMaterial
  lensGlass: MeshPhysicalMaterial
  /** Machined inner barrel wall visible through the lens glass. */
  lensBarrel: MeshPhysicalMaterial
  lensCavity: MeshPhysicalMaterial
  /** Faint deep sensor reflection inside each optical assembly. */
  sensorGlint: MeshPhysicalMaterial
  button: MeshPhysicalMaterial
  focusRing: MeshPhysicalMaterial
  logo: MeshPhysicalMaterial
  /** USB-C receptacle interior. */
  port: MeshPhysicalMaterial
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
}

export const MATERIAL_KEYS = [
  'frame',
  'back',
  'island',
  'screen',
  'display',
  'lensRing',
  'lensGlass',
  'lensBarrel',
  'lensCavity',
  'sensorGlint',
  'button',
  'focusRing',
  'logo',
  'port',
  'speaker',
  'antenna',
  'simTray',
  'flashRing',
  'flashGlass',
] as const satisfies ReadonlyArray<keyof PhoneMaterialSet>

function makeMaterial(overrides: MeshPhysicalMaterialParameters): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({ envMapIntensity: 1, ...overrides })
}

/** Creates a full independent material set for one phone instance. */
export function createPhoneMaterials(params: FinishParams): PhoneMaterialSet {
  const ceramic = createCeramicMottleTexture()
  const brush = createBrushTexture()
  const lensGloss = createLensGlossMap()

  const frame = makeMaterial({
    color: new Color(params.frameColor),
    metalness: 1,
    roughness: params.frameRoughness,
    roughnessMap: brush,
    anisotropy: params.frameAnisotropy,
    anisotropyRotation: Math.PI / 2,
    envMapIntensity: 1.2,
  })
  const back = makeMaterial({
    color: new Color(params.backColor),
    metalness: params.backMetalness,
    roughness: params.backRoughness,
    roughnessMap: ceramic.data,
    map: ceramic.color,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.35,
  })
  const island = makeMaterial({
    color: new Color(params.islandColor),
    metalness: params.backMetalness,
    roughness: Math.min(0.28, params.backRoughness * 0.8),
    roughnessMap: ceramic.data,
    map: ceramic.color,
    clearcoat: 0.75,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.5,
  })
  const screen = makeMaterial({
    color: new Color('#06080d'),
    metalness: 0,
    roughness: 0.045,
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
    roughness: 0.16,
    envMapIntensity: 1.3,
  })
  const lensGlass = makeMaterial({
    color: new Color('#0a101d'),
    metalness: 0,
    roughness: 0.025,
    roughnessMap: lensGloss,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 0.2,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.9,
  })
  const lensBarrel = makeMaterial({
    color: new Color('#171b22'),
    metalness: 0.95,
    roughness: 0.32,
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
  const logo = makeMaterial({
    color: new Color('#ffffff'),
    map: createLogoTexture(),
    metalness: 0,
    roughness: 1,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const port = makeMaterial({
    color: new Color('#0a0d12'),
    metalness: 0.9,
    roughness: 0.4,
    envMapIntensity: 0.5,
  })
  const speaker = makeMaterial({
    color: new Color('#05070a'),
    metalness: 0,
    roughness: 0.95,
  })
  const antenna = makeMaterial({
    color: new Color('#0b0c10'),
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

  display.emissiveMap = createScreenTexture()
  display.emissiveIntensity = 1.15

  return {
    frame,
    back,
    island,
    screen,
    display,
    lensRing,
    lensGlass,
    lensBarrel,
    lensCavity,
    sensorGlint,
    button,
    focusRing,
    logo,
    port,
    speaker,
    antenna,
    simTray,
    flashRing,
    flashGlass,
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
    for (const slot of [material.map, material.roughnessMap, material.emissiveMap] as const) {
      if (slot !== null && !seen.has(slot.uuid)) {
        seen.add(slot.uuid)
        slot.dispose()
      }
    }
    material.dispose()
  }
}
