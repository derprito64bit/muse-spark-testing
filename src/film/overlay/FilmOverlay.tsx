import { AnimatePresence, motion, type MotionValue } from 'motion/react'
import { useEffect, useState } from 'react'
import { CHAPTERS } from '../chapters.ts'
import { inspectHit } from '../inspect.ts'
import { ACTS } from '../timeline.ts'
import { useChapter } from '../useChapter.ts'
import { BigNumeral } from './BigNumeral.tsx'
import { Headline } from './Headline.tsx'
import { Kicker } from './Kicker.tsx'
import { SpecLines } from './SpecLines.tsx'
import { XrayReadout } from './XrayReadout.tsx'

interface FilmOverlayProps {
  progress: MotionValue<number>
}

/**
 * Editorial captions, act rail, scroll cue, and x-ray tooltip.
 * Chapters crossfade on opacity only (Jakub 200-400ms range); the rail
 * numbers a true sequence, so numbered markers encode real information.
 */
export function FilmOverlay({ progress }: FilmOverlayProps) {
  const act = useChapter(progress)
  const [scrolled, setScrolled] = useState(false)
  const [readout, setReadout] = useState<string | null>(null)
  const chapter = CHAPTERS.find((c) => c.act === act.id) ?? CHAPTERS[0]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (act.id !== 'xray' && act.id !== 'rebuild') {
      setReadout(null)
      return
    }
    const timer = window.setInterval(() => {
      const hit = inspectHit()
      setReadout(hit?.readout ?? null)
    }, 200)
    return () => window.clearInterval(timer)
  }, [act.id])

  if (chapter === undefined) return null
  return (
    <div className="pointer-events-none absolute inset-0" aria-live="polite">
      <div
        data-align={act.align}
        data-testid="film-chapter"
        data-act={act.id}
        className="absolute inset-x-0 bottom-24 flex justify-center px-6 text-center data-[align=left]:justify-start data-[align=left]:text-left data-[align=right]:justify-end data-[align=right]:text-right md:inset-x-16"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={act.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <Kicker>{chapter.kicker}</Kicker>
            <Headline>{chapter.headline}</Headline>
            <p className="mt-3 text-base text-(--color-dim)">{chapter.body}</p>
            {chapter.numeral !== undefined ? <BigNumeral numeral={chapter.numeral} /> : null}
            {chapter.spec !== undefined ? <SpecLines lines={chapter.spec} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {readout !== null ? (
        <div className="absolute left-1/2 top-24 -translate-x-1/2">
          <XrayReadout readout={readout} />
        </div>
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
              const max = document.documentElement.scrollHeight - window.innerHeight
              const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              window.scrollTo({ top: a.start * max, behavior: reduced ? 'instant' : 'smooth' })
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
