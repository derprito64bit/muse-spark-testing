import type { ActDef } from './key.ts'
import { AI_KEYS } from './acts/ai.ts'
import { APPROACH_KEYS } from './acts/approach.ts'
import { ARRIVAL_KEYS } from './acts/arrival.ts'
import { BATTERY_KEYS } from './acts/battery.ts'
import { CAMERA_KEYS } from './acts/camera.ts'
import { CHIP_KEYS } from './acts/chip.ts'
import { DISPLAY_KEYS } from './acts/display.ts'
import { FINAL_KEYS } from './acts/final.ts'
import { REBUILD_KEYS } from './acts/rebuild.ts'
import { SETTLE_KEYS } from './acts/settle.ts'
import { SOFTWARE_KEYS } from './acts/software.ts'
import { STORAGE_KEYS } from './acts/storage.ts'
import { XRAY_KEYS } from './acts/xray.ts'
import type { FilmKey } from './key.ts'

export const ACTS: ActDef[] = [
  { id: 'arrival', start: 0, end: 0.1, align: 'center' },
  { id: 'settle', start: 0.1, end: 0.155, align: 'center' },
  { id: 'approach', start: 0.155, end: 0.25, align: 'right' },
  { id: 'xray', start: 0.25, end: 0.33, align: 'left' },
  { id: 'chip', start: 0.33, end: 0.47, align: 'center' },
  { id: 'rebuild', start: 0.47, end: 0.52, align: 'bottom' },
  { id: 'camera', start: 0.52, end: 0.72, align: 'right' },
  { id: 'display', start: 0.72, end: 0.84, align: 'center' },
  { id: 'storage', start: 0.84, end: 0.89, align: 'right' },
  { id: 'battery', start: 0.89, end: 0.93, align: 'left' },
  { id: 'software', start: 0.93, end: 0.95, align: 'center' },
  { id: 'ai', start: 0.95, end: 0.975, align: 'right' },
  { id: 'final', start: 0.975, end: 1, align: 'center' },
]

/** Master keyframe list in authored order. Validated by validateTimeline. */
export const KEYS: FilmKey[] = [
  ...ARRIVAL_KEYS,
  ...SETTLE_KEYS,
  ...APPROACH_KEYS,
  ...XRAY_KEYS,
  ...CHIP_KEYS,
  ...REBUILD_KEYS,
  ...CAMERA_KEYS,
  ...DISPLAY_KEYS,
  ...STORAGE_KEYS,
  ...BATTERY_KEYS,
  ...SOFTWARE_KEYS,
  ...AI_KEYS,
  ...FINAL_KEYS,
]

/** Returns the act containing progress p in fraction units. */
export function actAt(p: number): ActDef {
  for (const act of ACTS) {
    if (p < act.end) return act
  }
  const last = ACTS[ACTS.length - 1]
  if (last === undefined) throw new Error('ACTS must not be empty')
  return last
}
