import { Head } from '../components/head/Head.tsx'
import { Glass } from '../components/Glass/Glass.tsx'
import { Film } from '../film/Film.tsx'
import { Scrubber } from '../film/Scrubber.tsx'

/** Home route: the product film plus the closing configurator deck. */
export function HomePage() {
  return (
    <>
      <Head
        title="Aether One X — Power, without the noise."
        description="A fictional flagship. Scroll-driven 3D film, honest specs, no third-party requests."
        path="/"
      />
      <Film />
      <section
        id="buy"
        aria-label="Configure your Aether One X"
        className="mx-auto max-w-6xl px-4 py-16"
      >
        <Glass variant="panel" label="Configurator">
          <div className="p-8 md:p-12">
            <p className="kicker">Configure</p>
            <h2 className="spec-num mt-3 text-4xl md:text-6xl">Make it yours.</h2>
            <p className="mt-3 text-(--color-dim)">The full configurator deck lands in M7.</p>
          </div>
        </Glass>
      </section>
      {import.meta.env.DEV ? <Scrubber /> : null}
    </>
  )
}
