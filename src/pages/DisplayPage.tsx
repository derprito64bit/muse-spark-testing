import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'

/** Display product page. Full content lands in M8. */
export function DisplayPage() {
  return (
    <>
      <Head
        title="Display — Aether One X"
        description="Fictional 6.7 inch LTPO OLED, 1 to 144 Hz."
        path="/display"
      />
      <PageHero
        kicker="Display"
        title="Light, controlled."
        lede="1 to 144 Hz adaptive, 2800 nits peak. Demonstration values."
      />
      <CtaBand />
    </>
  )
}
