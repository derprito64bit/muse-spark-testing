import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'
import { PhoneViewer } from '../components/PhoneViewer/PhoneViewer.tsx'
import { Reveal } from '../components/ui/Reveal.tsx'
import { Scrubber } from '../film/Scrubber.tsx'

/** Home route. The film lands here in M4/M5; M3 owns the static 3D studies. */
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
      <section aria-label="Front study" className="mx-auto max-w-6xl px-4">
        <Reveal>
          <PhoneViewer pose="hero" label="Aether One X three-quarter front view" />
        </Reveal>
      </section>
      <section aria-label="Rear study" className="mx-auto max-w-6xl px-4">
        <Reveal>
          <PhoneViewer pose="rear" label="Aether One X rear camera view" />
        </Reveal>
      </section>
      <section aria-label="Aether One X film" className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="spec-num text-3xl">The film arrives in M4.</h2>
          <p className="mt-2 text-(--color-dim)">
            Thirteen acts, one camera shot, zero third-party requests.
          </p>
        </Reveal>
      </section>
      <CtaBand />
      {import.meta.env.DEV ? <Scrubber /> : null}
    </>
  )
}
