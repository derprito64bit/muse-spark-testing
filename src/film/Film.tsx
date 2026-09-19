import { useScroll, type MotionValue } from 'motion/react'
import { Suspense, lazy, useEffect, useRef, useState, type RefObject } from 'react'
import { PhoneFrame } from '../components/Phone/PhoneFrame.tsx'
import { CHAPTERS } from './chapters.ts'
import { FilmOverlay } from './overlay/FilmOverlay.tsx'

const FilmCanvasLazy = lazy(() =>
  import('./FilmCanvas.tsx').then((m) => ({ default: m.FilmCanvas })),
)

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null
  } catch {
    return false
  }
}

function progressFromUrl(): number | null {
  try {
    const t = new URLSearchParams(window.location.search).get('t')
    if (t === null) return null
    const v = Number.parseFloat(t)
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : null
  } catch {
    return null
  }
}

/** Binds a MotionValue to the runway scroll position. */
function useRunwayProgress(runway: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] })
  return scrollYProgress
}

/**
 * The product film: one sticky stage inside a long runway, driven by a
 * single master scroll progress. Falls back to a static chapter list
 * without WebGL, on context loss, or with ?nogl.
 */
export function Film() {
  const runway = useRef<HTMLElement>(null)
  const progress = useRunwayProgress(runway)
  const [canRender] = useState(() => {
    try {
      return !new URLSearchParams(window.location.search).has('nogl') && webglAvailable()
    } catch {
      return false
    }
  })
  const [contextLost, setContextLost] = useState(false)
  const showFallback = !canRender || contextLost

  // ?t=0.42 deep link: jump the runway to that progress on mount.
  useEffect(() => {
    const t = progressFromUrl()
    if (t === null) return
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: t * max, behavior: 'instant' as ScrollBehavior })
  }, [])

  if (showFallback) {
    return (
      <section
        aria-label="Aether One X story"
        className="mx-auto max-w-6xl px-4 py-16"
        data-testid="film-fallback"
      >
        {CHAPTERS.map((chapter) => (
          <article
            key={chapter.act}
            aria-label={`Act ${chapter.act}`}
            className="grid gap-6 py-12 md:grid-cols-2"
          >
            <div>
              <p className="kicker">{chapter.kicker}</p>
              <h2 className="spec-num mt-3 text-4xl">{chapter.headline}</h2>
              <p className="mt-3 text-(--color-dim)">{chapter.body}</p>
            </div>
            <div className="flex justify-center">
              <PhoneFrame
                face={chapter.act === 'camera' ? 'rear' : 'front'}
                label={`${chapter.headline} (static view)`}
              />
            </div>
          </article>
        ))}
        {contextLost && (
          <p role="status" className="text-sm text-(--color-dim)">
            3D paused after a graphics reset. Static story shown.
          </p>
        )}
      </section>
    )
  }

  return (
    <section
      ref={runway}
      aria-label="Aether One X product film"
      style={{ height: 'var(--film-height)' }}
      data-testid="film-runway"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden supports-[height:100svh]:h-[100svh]">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center" role="status">
              <p className="kicker">Preparing the film</p>
            </div>
          }
        >
          <FilmCanvasLazy progress={progress} onContextLost={() => setContextLost(true)} />
        </Suspense>
        <FilmOverlay progress={progress} />
      </div>
    </section>
  )
}
