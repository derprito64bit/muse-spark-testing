import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'

/** Cameras product page. Full content lands in M8. */
export function CamerasPage() {
  return (
    <>
      <Head
        title="Cameras — Aether One X"
        description="Fictional triple camera. Five focal lengths."
        path="/cameras"
      />
      <PageHero
        kicker="Cameras"
        title="Every focal length."
        lede="Main, ultra-wide, and 5x telephoto. Demonstration values throughout."
      />
      <CtaBand />
    </>
  )
}
