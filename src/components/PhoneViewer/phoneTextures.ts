import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'

function colorFromCanvas(canvas: HTMLCanvasElement, anisotropy = 4): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  texture.anisotropy = anisotropy
  return texture
}

function dataFromCanvas(canvas: HTMLCanvasElement, anisotropy = 1): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = NoColorSpace
  texture.anisotropy = anisotropy
  return texture
}

function makeCanvas(
  sizeW: number,
  sizeH: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement('canvas')
  canvas.width = sizeW
  canvas.height = sizeH
  return { canvas, ctx: canvas.getContext('2d') }
}

/** Seeded deterministic pseudo-random generator so textures are stable per load. */
function seededRng(seed: number): () => number {
  let v = seed % 233280
  return () => {
    v = (v * 9301 + 49297) % 233280
    return v / 233280
  }
}

/** Subtle ceramic mottle: color map plus roughness data map from one canvas. */
export function createCeramicMottleTexture(): { color: CanvasTexture; data: CanvasTexture } {
  const { canvas, ctx } = makeCanvas(128, 128)
  if (ctx !== null) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    const rng = seededRng(2024 * 7919)
    for (let i = 0; i < 46; i++) {
      const x = rng() * 128
      const y = rng() * 128
      const r = 4 + rng() * 14
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(241,241,243,${0.35 + rng() * 0.35})`)
      g.addColorStop(1, 'rgba(241,241,243,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Etch sparkle: sparse subpixel facets, darker (smoother) in the
    // roughness channel so they glint under a raking source. Mipmaps average
    // them away at normal distance; they resolve only in macro, which is
    // exactly the specified behaviour.
    for (let i = 0; i < 130; i++) {
      const x = Math.floor(rng() * 128)
      const y = Math.floor(rng() * 128)
      const a = 0.25 + rng() * 0.45
      ctx.fillStyle = `rgba(96,96,104,${a.toFixed(3)})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  return { color: colorFromCanvas(canvas, 1), data: dataFromCanvas(canvas, 1) }
}

/** Fine parallel machining grooves for the titanium roughness channel. */
export function createBrushTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 64)
  if (ctx !== null) {
    const rng = seededRng(77 * 7919)
    const grooves: number[] = []
    let phase = 0
    for (let x = 0; x < 64; x++) {
      phase = phase * 0.86 + (rng() - 0.5) * 0.5
      let g = x % 2 === 0 ? 0.77 : 0.98
      g += (rng() - 0.5) * 0.05 + phase * 0.018
      grooves.push(Math.min(0.99, Math.max(0.68, g)))
    }
    for (const cx of [20, 21, 44, 45]) {
      const slot = grooves[cx]
      if (slot !== undefined) grooves[cx] = 0.62
    }
    for (let x = 0; x < 64; x++) {
      const slot = grooves[x]
      if (slot === undefined) continue
      const g = Math.round(slot * 255)
      ctx.fillStyle = `rgb(${g},${g},${g})`
      ctx.fillRect(x, 0, 1, 64)
    }
  }
  const texture = dataFromCanvas(canvas, 8)
  // Extrusion UVs run in meters, so the map must tile; repeat is scaled per
  // finish from grainAmplitude in createPhoneMaterials. Rotated a quarter
  // turn so groove lines run along each rail rather than across it.
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.center.set(0.5, 0.5)
  texture.rotation = Math.PI / 2
  return texture
}

/** Center-to-edge gloss gradient driving lens roughness. */
export function createLensGlossMap(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 64)
  if (ctx !== null) {
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
    g.addColorStop(0, '#a8a8b0')
    g.addColorStop(0.4, '#cfcfd6')
    g.addColorStop(1, '#f2f2f4')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
  }
  return dataFromCanvas(canvas, 1)
}

/**
 * Radial AR-coating thickness map: shift strengthens toward the lens edge,
 * as on a real curved coated element. Shared by all three lens glasses.
 */
export function createCoatingThicknessMap(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 64)
  if (ctx !== null) {
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
    g.addColorStop(0, '#3c3c3c')
    g.addColorStop(0.55, '#8a8a8a')
    g.addColorStop(1, '#e8e8e8')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
  }
  return dataFromCanvas(canvas, 1)
}

/** Vertical roughness gradient for barrel walls. Cylinder v=1 is the deep end. */
export function createBarrelGradientMap(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(8, 64)
  if (ctx !== null) {
    // Canvas top row is v=1 (flipY): deep end rough (0.9), mouth smooth (0.4).
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, '#e6e6e6')
    g.addColorStop(1, '#666666')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 8, 64)
  }
  return dataFromCanvas(canvas, 1)
}

/** Brand mark decal texture ("AETHER"). */
export function createLogoTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 128)
  if (ctx !== null) {
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = 'rgba(240,245,252,0.95)'
    ctx.font = '600 76px "Helvetica Neue", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('A E T H E R', 256, 68)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/** Procedural aurora wallpaper for the emissive display panel. */
export function createScreenTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 512)
  if (ctx !== null) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#0a1322')
    gradient.addColorStop(0.45, '#0d1c33')
    gradient.addColorStop(0.75, '#132741')
    gradient.addColorStop(1, '#0a1220')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 512)
    const glow = ctx.createRadialGradient(150, 150, 20, 150, 150, 220)
    glow.addColorStop(0, 'rgba(127,180,255,0.5)')
    glow.addColorStop(1, 'rgba(127,180,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 256, 512)
    ctx.fillStyle = 'rgba(240,246,255,0.9)'
    ctx.beginPath()
    ctx.arc(178, 96, 26, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(200,218,245,0.35)'
    ctx.beginPath()
    ctx.arc(60, 420, 40, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(200, 460, 28, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * Oleophobic smudge map for the front glass roughness channel. Mid-grey
 * base with darker (smoother) thumb-zone blobs in the lower third, kept
 * under the threshold of conscious notice.
 */
export function createSmudgeMap(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(128, 256)
  if (ctx !== null) {
    ctx.fillStyle = '#b0b0b0'
    ctx.fillRect(0, 0, 128, 256)
    const rng = (seed: number): number => {
      const v = (seed * 9301 + 49297) % 233280
      return v / 233280
    }
    for (let i = 0; i < 9; i++) {
      const x = 20 + rng(i + 1) * 88
      const y = 150 + rng(i + 40) * 90
      const r = 12 + rng(i + 80) * 22
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(112,112,112,0.55)')
      g.addColorStop(1, 'rgba(112,112,112,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return dataFromCanvas(canvas, 1)
}

/** Illegible regulatory micro-text for the rear panel. */
export function createRegulatoryTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 48)
  if (ctx !== null) {
    ctx.clearRect(0, 0, 256, 48)
    ctx.fillStyle = 'rgba(220,228,238,0.4)'
    ctx.font = '400 11px monospace'
    ctx.fillText('AX-1U · 3.7V · IP68 · SN 0042', 8, 20)
    ctx.fillText('RoHS · CE · FCC ID AX1U2026', 8, 36)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * Off-screen finish: a barely-there vertical gradient with a blue-violet
 * polarizer cast. Multiplied over the near-black base it keeps the panel a
 * dark mirror instead of a flat black.
 */
export function createScreenGradientTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(16, 256)
  if (ctx !== null) {
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#e9edff')
    g.addColorStop(0.45, '#f4f6ff')
    g.addColorStop(1, '#d9dff5')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 256)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Subpixel hint: high-frequency RGB stripes at very low amplitude for the
 * macro display overlay. Faded in only below ~12cm camera distance by the
 * model shell; never shipped at normal distance, where it would alias.
 */
export function createSubpixelTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(96, 32)
  if (ctx !== null) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 96, 32)
    for (let x = 0; x < 96; x += 3) {
      ctx.fillStyle = 'rgba(255,64,64,0.5)'
      ctx.fillRect(x, 0, 1, 32)
      ctx.fillStyle = 'rgba(64,255,64,0.5)'
      ctx.fillRect(x + 1, 0, 1, 32)
      ctx.fillStyle = 'rgba(64,64,255,0.5)'
      ctx.fillRect(x + 2, 0, 1, 32)
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(24, 24)
  return texture
}
