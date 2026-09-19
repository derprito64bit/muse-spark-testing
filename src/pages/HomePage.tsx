import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'
import { Reveal } from '../components/ui/Reveal.tsx'

/** Home route. The film lands here in M4/M5. */
export function HomePage() {
  return (
    <>
      <Head
        title="Aether One X — Power, without the noise."
        description="A fictional flagship. Scroll-driven 3D film, honest specs, no third-party requests."
        path="/"
      />
      <PageHero
        kicker="Aether One X"
        title="Power, without the noise."
        lede="A fictional flagship presented as one continuous scroll-driven film. All specs are illustrative demonstration values."
      />
      <section aria-label="Aether One X film" className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal>
          <h2 className="spec-num text-3xl">The film arrives in M4.</h2>
          <p className="mt-2 text-(--color-dim)">
            Thirteen acts, one camera shot, zero third-party requests.
          </p>
        </Reveal>
      </section>
      <CtaBand />
    </>
  )
}
