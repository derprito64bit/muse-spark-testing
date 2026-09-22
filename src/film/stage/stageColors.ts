import * as THREE from 'three'
import { ACTS } from '../timeline.ts'
import { STAGE_LIGHTING } from '../lighting.ts'

const scratchColor = new THREE.Color()
const scratchTop = new THREE.Color()
const scratchTarget = new THREE.Color()

/**
 * Stage colours as pure functions of progress (Prompt D section 8.2).
 * Within an act, colours lerp from the previous act's stage to this act's,
 * so the colour journey is continuous and reverses exactly on scrub.
 */
export function stageColors(p: number): { base: THREE.Color; top: THREE.Color } {
  let index = ACTS.findIndex((act) => p >= act.start && p < act.end)
  if (index < 0) index = p >= 1 ? ACTS.length - 1 : 0
  const act = ACTS[index]
  const prev = ACTS[Math.max(0, index - 1)]
  const current = STAGE_LIGHTING[act?.id ?? 'arrival']
  const before = STAGE_LIGHTING[prev?.id ?? 'arrival']
  const span = Math.max(1e-5, (act?.end ?? 1) - (act?.start ?? 0))
  const t = Math.min(1, Math.max(0, (p - (act?.start ?? 0)) / span))
  // Colour arrives over the first half of each act, then rests.
  const x = Math.min(1, t * 2)
  const eased = 1 - Math.pow(1 - x, 2)
  scratchColor.set(before.stage).lerp(scratchTarget.set(current.stage), eased)
  scratchTop.set(before.stageTop).lerp(scratchTarget.set(current.stageTop), eased)
  return { base: scratchColor, top: scratchTop }
}
