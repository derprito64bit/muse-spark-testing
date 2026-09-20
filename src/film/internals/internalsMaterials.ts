import { Color, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { createDieMarkingTexture, createFloorplanTexture } from './siliconTextures.ts'

export interface InternalsMaterialSet {
  board: MeshStandardMaterial
  trace: MeshStandardMaterial
  shield: MeshStandardMaterial
  gold: MeshStandardMaterial
  substrate: MeshStandardMaterial
  die: MeshStandardMaterial
  cell: MeshStandardMaterial
  cellGlow: MeshStandardMaterial
  housing: MeshStandardMaterial
  coil: MeshStandardMaterial
  dark: MeshStandardMaterial
  /** Laser marking decal, low contrast. */
  dieMark: MeshBasicMaterial
  /** Floorplan detail overlay. */
  dieFloor: MeshBasicMaterial
}

export const INTERNALS_KEYS = [
  'board',
  'trace',
  'shield',
  'gold',
  'substrate',
  'die',
  'cell',
  'cellGlow',
  'housing',
  'coil',
  'dark',
  'dieMark',
  'dieFloor',
] as const satisfies ReadonlyArray<keyof InternalsMaterialSet>

/**
 * X-ray hardware material registry. All transparent from birth so the
 * opacity dissolve never triggers a shader recompile mid-film.
 */
export function createInternalsMaterials(): InternalsMaterialSet {
  const transparent = { transparent: true, opacity: 0 }
  const board = new MeshStandardMaterial({
    color: new Color('#0d2b26'),
    roughness: 0.55,
    metalness: 0.2,
    ...transparent,
  })
  const trace = new MeshStandardMaterial({
    color: new Color('#c98f2e'),
    roughness: 0.35,
    metalness: 1,
    emissive: new Color('#3a2703'),
    emissiveIntensity: 0.6,
    ...transparent,
  })
  const shield = new MeshStandardMaterial({
    color: new Color('#9aa2ad'),
    roughness: 0.3,
    metalness: 1,
    ...transparent,
  })
  const gold = new MeshStandardMaterial({
    color: new Color('#d8a83e'),
    roughness: 0.25,
    metalness: 1,
    ...transparent,
  })
  const substrate = new MeshStandardMaterial({
    color: new Color('#12351f'),
    roughness: 0.5,
    metalness: 0.3,
    ...transparent,
  })
  const die = new MeshStandardMaterial({
    color: new Color('#101623'),
    roughness: 0.2,
    metalness: 0.6,
    emissive: new Color('#2f63c8'),
    emissiveIntensity: 0.7,
    ...transparent,
  })
  const cell = new MeshStandardMaterial({
    color: new Color('#b9c1cc'),
    roughness: 0.35,
    metalness: 0.9,
    ...transparent,
  })
  const cellGlow = new MeshStandardMaterial({
    color: new Color('#7fb4ff'),
    emissive: new Color('#478dff'),
    emissiveIntensity: 1.2,
    roughness: 0.4,
    metalness: 0,
    ...transparent,
  })
  const housing = new MeshStandardMaterial({
    color: new Color('#22262e'),
    roughness: 0.45,
    metalness: 0.8,
    ...transparent,
  })
  const coil = new MeshStandardMaterial({
    color: new Color('#b06a28'),
    roughness: 0.35,
    metalness: 1,
    ...transparent,
  })
  const dark = new MeshStandardMaterial({
    color: new Color('#05070a'),
    roughness: 0.9,
    metalness: 0,
    ...transparent,
  })
  const dieMark = new MeshBasicMaterial({
    map: createDieMarkingTexture(),
    depthWrite: false,
    ...transparent,
  })
  dieMark.opacity = 0
  const dieFloor = new MeshBasicMaterial({
    map: createFloorplanTexture(),
    depthWrite: false,
    ...transparent,
  })
  dieFloor.opacity = 0
  return {
    board,
    trace,
    shield,
    gold,
    substrate,
    die,
    cell,
    cellGlow,
    housing,
    coil,
    dark,
    dieMark,
    dieFloor,
  }
}

/** Disposes every registry material. Safe to call once per owner. */
export function disposeInternalsMaterials(set: InternalsMaterialSet): void {
  for (const k of INTERNALS_KEYS) set[k].dispose()
}
