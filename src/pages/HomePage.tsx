import { Head } from '../components/head/Head.tsx'
import { BuyDeck } from '../components/Configurator/BuyDeck.tsx'
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
      <BuyDeck />
      {import.meta.env.DEV ? <Scrubber /> : null}
    </>
  )
}
