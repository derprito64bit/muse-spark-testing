import { useMemo } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

RectAreaLightUniformsLib.init()

/**
 * Studio rig, M3R section 5. One long softbox (the rail highlight), one
 * narrow strip edge-on to the rail (the chamfer highlight), a cool dim rim,
 * a soft fill, a screen-bounce glow in front of the device, and a rear
 * softbox that rakes the camera pad. The two area lights plus the
 * environment panels are what keep the rail highlight travelling
 * continuously through a full rotation.
 */
export function PhoneLighting({
  bounceTint = '#8fa8ff',
  rear = false,
}: {
  bounceTint?: string
  rear?: boolean
}) {
  const rig = useMemo(() => {
    // Key softbox off the face axis: rakes the rails without washing the
    // flat glass into a gray card. A near-frontal area source reads flat;
    // fifty degrees off-axis reads as a travelling line.
    const key = new THREE.RectAreaLight('#ffffff', 4.2, 0.45, 0.3)
    key.position.set(0.85, 0.45, 0.5)
    key.lookAt(0, 0, 0)
    const strip = new THREE.RectAreaLight('#dfe9ff', 4, 0.1, 0.5)
    strip.position.set(-0.7, 0.15, 0.55)
    strip.lookAt(0, 0, 0)
    // Rear softbox: cool, high, behind. Lifts the plateau out of the rim
    // shadow on rear and side studies; idles low on front views so the
    // silhouette still separates without flattening.
    const rearSoft = new THREE.RectAreaLight('#e8f1ff', rear ? 3.2 : 0.8, 0.4, 0.3)
    rearSoft.position.set(-0.4, 0.55, -0.95)
    rearSoft.lookAt(0, 0.02, 0)
    return { key, strip, rearSoft }
  }, [rear])
  return (
    <group>
      <primitive object={rig.key} />
      <primitive object={rig.strip} />
      <primitive object={rig.rearSoft} />
      <directionalLight position={[-0.3, -0.6, -1]} intensity={1.1} color="#7fb4ff" />
      <directionalLight position={[-0.9, 0.2, 0.6]} intensity={0.55} color="#bcd2ff" />
      <pointLight
        position={[0, 0.02, 0.45]}
        intensity={0.22}
        distance={1.4}
        decay={2}
        color={bounceTint}
      />
      <ambientLight intensity={0.3} color="#dfe8ff" />
    </group>
  )
}
