/** Three-point studio rig plus a procedural gradient backdrop. Local lights only. */
export function PhoneLighting() {
  return (
    <group>
      <directionalLight position={[0.6, 0.9, 1.2]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-0.9, 0.2, 0.6]} intensity={0.7} color="#bcd2ff" />
      <directionalLight position={[-0.3, -0.6, -1]} intensity={1.1} color="#7fb4ff" />
      <ambientLight intensity={0.35} color="#dfe8ff" />
    </group>
  )
}
