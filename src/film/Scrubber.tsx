import { useCallback, useEffect, useState } from 'react'
import { sampleFilm } from './sample.ts'
import { scrollToProgress, progressFromUrl } from './scroll.ts'
import { computeFilmStates } from './states.ts'
import { actAt } from './timeline.ts'

/** Stack-axis-into-view, the number Part A iterates on (round 03 Part F). */
function stackAxisIntoView(p: number): number {
  const s = sampleFilm(p)
  const vx = s.target.x - s.pos.x
  const vy = s.target.y - s.pos.y
  const vz = s.target.z - s.pos.z
  const m = Math.hypot(vx, vy, vz)
  const cosRx = Math.cos(s.rx)
  const sinRx = Math.sin(s.rx)
  const cosRy = Math.cos(s.ry)
  const sinRy = Math.sin(s.ry)
  // Phone-local +z (the stack axis) through pose euler XYZ.
  const y1 = cosRx * 0 - sinRx * 1
  const z1 = sinRx * 0 + cosRx * 1
  const x2 = cosRy * 0 + sinRy * z1
  const z2 = -sinRy * 0 + cosRy * z1
  return Math.abs((x2 * vx + y1 * vy + z2 * vz) / Math.max(1e-9, m))
}

/**
 * Dev-only timeline scrubber. Toggle with the `.` key. The slider scrolls
 * the runway itself (round 03 Part F), so the film, overlay, and readout
 * all follow the single scroll-driven source of truth — dragging it *is*
 * the reverse scrub from the verification ritual. Slider, current act,
 * teardown state, live sampled pose/camera, and a copy-this-pose button.
 * `?t=0.42` jumps. Excluded from production by the DEV guard at the call site.
 */
export function Scrubber() {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(() => progressFromUrl() ?? 0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '.') setOpen((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copyKey = useCallback(async () => {
    const s = sampleFilm(progress)
    const literal = `key({
  at: ${progress.toFixed(3)},
  pose: { rx: ${s.rx.toFixed(3)}, ry: ${s.ry.toFixed(3)}, rz: ${s.rz.toFixed(3)}, scale: ${s.scale.toFixed(3)}, px: ${s.px.toFixed(4)}, py: ${s.py.toFixed(4)} },
  camera: { pos: [${s.pos.x.toFixed(4)}, ${s.pos.y.toFixed(4)}, ${s.pos.z.toFixed(4)}], target: [${s.target.x.toFixed(4)}, ${s.target.y.toFixed(4)}, ${s.target.z.toFixed(4)}] },
  lens: { fov: ${s.fov.toFixed(1)}${s.fit !== null ? `, fit: ${s.fit.toFixed(2)}` : ''} },
  look: { exposure: ${s.exposure.toFixed(2)}, glass: ${s.glass.toFixed(2)} },
}),`
    try {
      await navigator.clipboard.writeText(literal)
    } catch {
      // Clipboard unavailable; the readout below is still copyable by hand.
    }
  }, [progress])

  if (!open) return null
  const sample = sampleFilm(progress)
  const act = actAt(progress)
  const st = computeFilmStates(progress)

  const onScrub = (v: number) => {
    setProgress(v)
    // Drive the page, not a shadow value: useScroll propagates the scroll
    // into the film's MotionValue, so slider, film, and readout agree.
    const runway = document.querySelector('[data-testid="film-runway"]')
    if (runway instanceof HTMLElement) scrollToProgress(runway, v, 'auto')
  }

  return (
    <div
      role="dialog"
      aria-label="Film timeline scrubber"
      className="fixed bottom-4 left-4 z-50 w-80 rounded-xl border border-(--color-border-hairline) bg-(--color-surface) p-4 font-mono text-xs"
    >
      <p className="flex justify-between">
        <span>t = {progress.toFixed(3)}</span>
        <span>act: {act.id}</span>
      </p>
      <p className="flex justify-between text-(--color-dim)">
        <span>
          cursor {st.layerCursor.toFixed(2)} sep {st.stackSeparate.toFixed(2)}
        </span>
        <span>axis·view {stackAxisIntoView(progress).toFixed(3)}</span>
      </p>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={(e) => onScrub(Number.parseFloat(e.target.value))}
        aria-label="Film progress"
        className="mt-2 w-full"
      />
      <pre className="mt-2 overflow-x-auto whitespace-pre text-[10px] text-(--color-dim)">
        {`pos ${sample.pos.x.toFixed(3)} ${sample.pos.y.toFixed(3)} ${sample.pos.z.toFixed(3)}\ntgt ${sample.target.x.toFixed(3)} ${sample.target.y.toFixed(3)} ${sample.target.z.toFixed(3)}\npose rx ${sample.rx.toFixed(3)} ry ${sample.ry.toFixed(3)} s ${sample.scale.toFixed(2)}\nfov ${sample.fov.toFixed(1)} fit ${sample.fit === null ? 'macro' : sample.fit.toFixed(2)}`}
      </pre>
      <button
        type="button"
        onClick={() => void copyKey()}
        className="mt-2 rounded-full border border-(--color-border-hairline) px-3 py-1"
      >
        Copy pose as keyframe
      </button>
    </div>
  )
}
