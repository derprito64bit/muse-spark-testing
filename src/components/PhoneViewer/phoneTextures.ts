import { CanvasTexture, NoColorSpace } from 'three'

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
  return dataFromCanvas(canvas, 1)
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
  texture.colorSpace = 'srgb'
  texture.needsUpdate = true
  return texture
}
