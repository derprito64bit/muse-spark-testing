import { Head } from '../components/head/Head.tsx'
import { CtaBand } from '../components/layout/CtaBand.tsx'
import { PageHero } from '../components/layout/PageHero.tsx'
import { FocalStrip } from '../components/CameraStrip/FocalStrip.tsx'
import { PhoneConfigProvider } from '../components/PhoneViewer/PhoneConfig.tsx'
import { PhoneViewer } from '../components/PhoneViewer/PhoneViewer.tsx'

/** Cameras product page: focal strip wired to a rear 3D study. */
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
      <PhoneConfigProvider>
        <FocalStrip />
        <PhoneViewer pose="rear" label="Aether One X rear camera study" sharedConfig />
      </PhoneConfigProvider>
      <CtaBand />
    </>
  )
}
