import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'

/** Software product page. Full content lands in M8. */
export function SoftwarePage() {
  return (
    <>
      <Head
        title="Software — Aether One X"
        description="Fictional AetherOS. On-device intelligence."
        path="/software"
      />
      <PageHero
        kicker="Software"
        title="Quiet software."
        lede="AetherOS with on-device intelligence. Nothing leaves the phone."
      />
      <CtaBand />
    </>
  )
}
