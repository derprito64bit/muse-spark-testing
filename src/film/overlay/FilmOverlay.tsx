import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Glass } from '../../components/Glass/Glass.tsx'
import { CHAPTERS, TEARDOWN_COPY } from '../chapters.ts'
import { inspectHit } from '../inspect.ts'
import { luminance, scrimForStage, stageColors } from '../stage/stageColors.ts'
import { scrollToProgress } from '../scroll.ts'
import { TEARDOWN_LAYERS, cursorAt } from '../teardown/layers.ts'
import { ACTS } from '../timeline.ts'
import { useChapter } from '../useChapter.ts'
import { BigNumeral } from './BigNumeral.tsx'
import { Callouts } from './Callouts.tsx'
import { Headline } from './Headline.tsx'
import { Kicker } from './Kicker.tsx'
import { SpecLines } from './SpecLines.tsx'
import { XrayReadout } from './XrayReadout.tsx'

interface FilmOverlayProps {
  progress: MotionValue<number>
  /** Runway section: rail and keyboard jumps map progress through it. */
  runway: RefObject<HTMLElement | null>
}

/**
 * Editorial captions, act rail, scroll cue, and x-ray tooltip.
 * Chapters crossfade on opacity only (Jakub 200-400ms range); the rail
 * numbers a true sequence, so numbered markers encode real information.
 */
export function FilmOverlay({ progress, runway }: FilmOverlayProps) {
  const act = useChapter(progress)
  const [scrolled, setScrolled] = useState(false)
  const [readout, setReadout] = useState<string | null>(null)
  const chapter = CHAPTERS.find((c) => c.act === act.id) ?? CHAPTERS[0]
  // Teardown layer cards: all ten render once in a grid stack and a rAF
  // loop writes opacity/transform straight from the continuous cursor
  // (round 03 Part B). AnimatePresence mode="wait" wedged on fast scrolls
  // (280ms exits vs 0.02 progress per layer); scroll-positioned cards are
  // exactly reversible because they are a pure function of progress.
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const c = Math.min(cursorAt(progress.get()), 9.5)
      for (let i = 0; i < TEARDOWN_COPY.length; i++) {
        const el = cardRefs.current[i]
        if (el === null || el === undefined) continue
        const d = c - i
        const entry = Math.min(1, Math.max(0, (d + 0.15) / 0.15))
        const exit = Math.min(1, Math.max(0, (1 - d) / 0.1))
        const o = entry * exit
        el.style.opacity = String(o)
        el.style.visibility = o <= 0.01 ? 'hidden' : 'visible'
        el.style.transform = `translateY(${((1 - o) * 12).toFixed(2)}px)`
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  // "Scroll to play" hint: progress-driven, never a scroll listener
  // (round 01 A10 — scroll values stay out of React state entirely).
  useMotionValueEvent(progress, 'change', (p) => {
    setScrolled((typeof p === 'number' ? p : 0) > 0.002)
  })

  useEffect(() => {
    if (act.id !== 'teardown') {
      setReadout(null)
      return
    }
    const timer = window.setInterval(() => {
      const hit = inspectHit()
      setReadout(hit?.readout ?? null)
    }, 200)
    return () => window.clearInterval(timer)
  }, [act.id])

  // Auto-scroll the teardown tour (overnight watchability): one press
  // plays the ten layer windows at ~3s per layer while the camera tours
  // the open stack. Any manual input (wheel, touch, keys) takes over
  // instantly. Never offered under reduced motion. Pure scroll driving —
  // the film follows exactly.
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlaying(false)
      return
    }
    let raf = 0
    let last = performance.now()
    const stop = (): void => setPlaying(false)
    const onInterrupt = (): void => stop()
    window.addEventListener('wheel', onInterrupt, { passive: true })
    window.addEventListener('touchstart', onInterrupt, { passive: true })
    window.addEventListener('keydown', onInterrupt)
    const step = (now: number): void => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const el = runway.current
      if (el === null) return
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const span = rect.height - window.innerHeight
      if (span <= 0) return
      const p = (window.scrollY - top) / span
      const np = p + (dt * 0.2) / 30
      if (np >= 0.495 || p >= 0.52) {
        stop()
        return
      }
      scrollToProgress(el, Math.max(np, 0.295), 'auto')
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onInterrupt)
      window.removeEventListener('touchstart', onInterrupt)
      window.removeEventListener('keydown', onInterrupt)
    }
  }, [playing, runway])

  // Keyboard film navigation: arrows jump between acts with an aria-live
  // announcement of the act name (the chapter container below is the live
  // region). Ignored inside text fields and the dev scrubber slider.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      const target = event.target as HTMLElement | null
      if (target !== null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const index = ACTS.findIndex((a) => a.id === act.id)
      const next = event.key === 'ArrowRight' ? ACTS[index + 1] : ACTS[index - 1]
      if (next === undefined) return
      event.preventDefault()
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const el = runway.current
      if (el !== null) scrollToProgress(el, next.start, reduced ? 'instant' : 'smooth')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [act.id, runway])

  // Scroll-driven page tint (Prompt D section 8.1): the act colour at low
  // opacity over the page. Written straight to the DOM, never React state.
  // Hooks stay above the empty-chapters bail so the order never changes.
  const tintRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  useMotionValueEvent(progress, 'change', (p) => {
    const v = typeof p === 'number' ? p : 0
    const { base } = stageColors(v)
    const baseHex = `#${base.getHexString()}`
    const tint = tintRef.current
    if (tint !== null) tint.style.backgroundColor = `${baseHex}2e`
    // Cream room: light stages wear ink text directly instead of the dark
    // veil (Prompt D 11 scrim only applies while a stage is actually dark).
    const light = luminance(baseHex) > 0.25
    const root = rootRef.current
    if (root !== null) root.classList.toggle('light-scope', light)
    const scrim = scrimRef.current
    if (scrim !== null) scrim.style.opacity = light ? '0' : String(scrimForStage(baseHex))
  })
  if (chapter === undefined) return null
  return (
    <div
      ref={rootRef}
      className="light-scope pointer-events-none absolute inset-0"
      aria-live="polite"
    >
      <div ref={tintRef} aria-hidden="true" className="absolute inset-0" />
      <div
        ref={scrimRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.92) 38%, rgba(5,6,10,0) 68%)',
          opacity: 0,
        }}
      />
      <div
        data-align={act.align}
        data-testid="film-chapter"
        data-act={act.id}
        className={
          act.id === 'teardown'
            ? // Fixed two-column split: text left 42%, subject right 58% (the
              // camera holds the right side). Under 900px the text drops to
              // the lower 45% and the stack shifts up via the compact gap.
              'absolute inset-x-0 bottom-0 flex justify-center px-6 pb-24 text-center md:bottom-auto md:left-16 md:right-auto md:top-1/2 md:w-[42%] md:-translate-y-1/2 md:justify-start md:px-0 md:pb-0 md:text-left'
            : 'absolute inset-x-0 bottom-24 flex justify-center px-6 text-center data-[align=left]:justify-start data-[align=left]:text-left data-[align=right]:justify-end data-[align=right]:text-right md:inset-x-16'
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="max-w-xl"
          >
            {act.id === 'teardown' ? (
              <div className="grid">
                {TEARDOWN_COPY.map((copy, i) => (
                  <div
                    key={copy.key}
                    ref={(el) => {
                      cardRefs.current[i] = el
                    }}
                    data-testid={`teardown-card-${copy.key}`}
                    className="col-start-1 row-start-1"
                  >
                    <div
                      aria-hidden="true"
                      className="mb-3 h-px w-10"
                      style={{ backgroundColor: TEARDOWN_LAYERS[i]?.accent ?? '#7fb4ff' }}
                    />
                    <Kicker>{copy.kicker}</Kicker>
                    <Headline>{copy.headline}</Headline>
                    <p className="mt-3 text-base text-(--color-dim)">{copy.body}</p>
                    <p className="spec-tech mt-3 text-(--color-dim)">{copy.figure}</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Kicker>{chapter.kicker}</Kicker>
                <Headline>{chapter.headline}</Headline>
                <p className="mt-3 text-base text-(--color-dim)">{chapter.body}</p>
                {chapter.numeral !== undefined ? <BigNumeral numeral={chapter.numeral} /> : null}
                {chapter.spec !== undefined ? <SpecLines lines={chapter.spec} /> : null}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {readout !== null ? (
        <div className="absolute left-1/2 top-24 -translate-x-1/2">
          <Glass variant="tooltip" label="Inspected part">
            <XrayReadout readout={readout} />
          </Glass>
        </div>
      ) : null}

      {act.id === 'teardown' && <Callouts progress={progress} />}

      {act.id === 'teardown' ? (
        <button
          type="button"
          aria-pressed={playing}
          aria-label={playing ? 'Pause the teardown showcase' : 'Play the teardown showcase'}
          data-testid="teardown-play"
          onClick={() => setPlaying((v) => !v)}
          className="kicker pointer-events-auto absolute bottom-8 right-4 opacity-70 hover:opacity-100 md:right-16"
        >
          {playing ? 'Pause ❚❚' : 'Play showcase ▸'}
        </button>
      ) : null}

      <nav
        aria-label="Film acts"
        className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex"
      >
        {ACTS.map((a, i) => (
          <a
            key={a.id}
            href={`#act-${a.id}`}
            aria-label={`Act ${i + 1}: ${a.id}`}
            aria-current={a.id === act.id ? 'true' : undefined}
            data-active={a.id === act.id}
            className="kicker opacity-40 data-[active=true]:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              const el = runway.current
              if (el !== null) scrollToProgress(el, a.start, reduced ? 'instant' : 'smooth')
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </a>
        ))}
      </nav>

      {!scrolled ? (
        <p className="spec-tech absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse">
          Scroll to play
        </p>
      ) : null}
    </div>
  )
}
