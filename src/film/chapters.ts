import {
  BATTERY,
  CAMERA_LENSES,
  CHIPSET,
  DISPLAY,
  MEMORY,
  PERFORMANCE,
  STORAGE_OPTIONS,
} from '../data/product.ts'
import { formatNumber } from '../lib/format.ts'
import type { ActId } from './key.ts'

export interface ChapterNumeral {
  value: string
  unit: string
}

export interface Chapter {
  act: ActId
  kicker: string
  headline: string
  body: string
  numeral?: ChapterNumeral
  spec?: string[]
}

/**
 * Editorial captions per act. Copy lives here as data, never inline in JSX.
 * Every figure is imported from src/data so the film and the specifications
 * page can never disagree.
 */
export const CHAPTERS: Chapter[] = [
  {
    act: 'arrival',
    kicker: 'Aether One X',
    headline: 'Power, without the noise.',
    body: 'A fictional flagship, presented in one continuous shot.',
  },
  {
    act: 'settle',
    kicker: 'Grade-5 titanium',
    headline: 'Quiet from every angle.',
    body: 'Machined rails, ceramic back, symmetrical 1.45 mm bezels.',
  },
  {
    act: 'approach',
    kicker: 'Front glass',
    headline: 'Edge to edge.',
    body: 'The display runs to the frame on all four sides.',
  },
  {
    act: 'xray',
    kicker: 'Inside',
    headline: 'Every layer earns its place.',
    body: 'Board, silicon, cell, and optics. Hover to inspect each part.',
  },
  {
    act: 'chip',
    kicker: CHIPSET.name,
    headline: `${CHIPSET.processNm} nm. ${CHIPSET.cpuCores} cores. Zero noise.`,
    body: `A ${CHIPSET.dieAreaMm2} mm2 die with a ${CHIPSET.gpuCores}-core GPU and a dedicated neural engine.`,
    numeral: { value: formatNumber(PERFORMANCE.cpu.hero.value), unit: PERFORMANCE.cpu.hero.suffix },
    spec: [`NPU ${PERFORMANCE.npu.hero.value} ${PERFORMANCE.npu.hero.suffix} on-device`],
  },
  {
    act: 'rebuild',
    kicker: 'Assembly',
    headline: 'Sealed in a single motion.',
    body: 'The stack repacks, the shell closes, nothing shifts.',
  },
  {
    act: 'camera',
    kicker: 'Triple camera',
    headline: 'Five focal lengths.',
    body: CAMERA_LENSES[0]?.detail ?? '',
    numeral: { value: String(CAMERA_LENSES[0]?.mp ?? 50), unit: 'MP main' },
    spec: [`${CAMERA_LENSES[1]?.mp ?? 48} MP ultra-wide`, `${CAMERA_LENSES[2]?.detail ?? ''}`],
  },
  {
    act: 'display',
    kicker: 'LTPO OLED',
    headline: 'Light, controlled.',
    body: `${DISPLAY.size} panel, 1 to ${DISPLAY.refreshMax} Hz adaptive.`,
    numeral: { value: formatNumber(DISPLAY.peakNits), unit: 'nits peak' },
    spec: [`${DISPLAY.resolution}`, `${DISPLAY.pwm} Hz dimming`],
  },
  {
    act: 'storage',
    kicker: 'Storage',
    headline: 'Room for everything.',
    body: `UFS 4.1 with ${MEMORY.ramGb} GB ${MEMORY.type} alongside.`,
    numeral: { value: String((STORAGE_OPTIONS[2]?.gb ?? 1024) / 1024), unit: 'TB max' },
    spec: STORAGE_OPTIONS.map((s) => `${s.label} · $${s.price}`),
  },
  {
    act: 'battery',
    kicker: 'Silicon-carbon',
    headline: 'Two days. Then minutes.',
    body: `${BATTERY.charge50Min} minutes on ${BATTERY.wired} W refills half the cell.`,
    numeral: { value: formatNumber(BATTERY.capacity), unit: 'mAh' },
    spec: [`${BATTERY.wireless} W wireless`, `${BATTERY.reverse} W reverse`],
  },
  {
    act: 'software',
    kicker: 'AetherOS 2.0',
    headline: 'Software that steps aside.',
    body: 'On-device summaries, offline transcription, private photo cleanup.',
  },
  {
    act: 'ai',
    kicker: 'On-device AI',
    headline: 'Intelligence, kept inside.',
    body: `The neural engine delivers ${PERFORMANCE.npu.hero.value} ${PERFORMANCE.npu.hero.suffix}. Nothing leaves the phone.`,
    numeral: { value: String(PERFORMANCE.npu.hero.value), unit: PERFORMANCE.npu.hero.suffix },
  },
  {
    act: 'final',
    kicker: 'Aether One X',
    headline: 'Choose your finish.',
    body: 'Three finishes, three capacities. Configure below.',
  },
]
