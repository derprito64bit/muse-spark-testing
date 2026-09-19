import { Head } from '../components/head/Head.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'
import { CONCEPT_NOTICE } from '../data/product.ts'

/** Specifications page. Full tables land in M2/M8. */
export function SpecificationsPage() {
  return (
    <>
      <Head
        title="Specifications — Aether One X"
        description="Every fictional spec, expanded."
        path="/specifications"
      />
      <PageHero
        kicker="Specifications"
        title="Nothing hidden."
        lede="Every category expanded. All values illustrative."
      />
      <section aria-label="Fiction disclaimer" className="mx-auto max-w-6xl px-4 pb-16">
        <p className="text-sm text-(--color-dim)">{CONCEPT_NOTICE}</p>
      </section>
    </>
  )
}
