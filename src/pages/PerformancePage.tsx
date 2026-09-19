import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'

/** Performance product page. Full content lands in M8. */
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
      <CtaBand />
    </>
  )
}
