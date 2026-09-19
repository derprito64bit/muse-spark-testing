import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'
import { SoCPanel } from '../components/SoC/SoCPanel.tsx'

/** Performance product page: the A1 Ultra die panel. */
export function PerformancePage() {
  return (
    <>
      <Head
        title="Performance — Aether One X"
        description="Fictional A1 Ultra die. CPU, GPU, NPU."
        path="/performance"
      />
      <PageHero
        kicker="Performance"
        title="A1 Ultra."
        lede="Eight cores, fourteen GPU cores, on-device inference. Demonstration figures."
      />
      <SoCPanel />
      <CtaBand />
    </>
  )
}
