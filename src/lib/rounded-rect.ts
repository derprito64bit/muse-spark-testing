/**
 * Rounded-rectangle outline sampled by polar angle (round 02): straight
 * rails with tangent circular-arc corners — the iPhone silhouette the
 * superellipse's ever-curving sides never quite land. Ray-cast
 * construction: point on the boundary along each ray from the center, so
 * loops stay phase-compatible (+X start, monotone CCW, identical counts)
 * and the frame-ring annulus keeps its angle-matched indexing. Pure math,
 * unit tested.
 */

export type Point2 = readonly [number, number]

/** Point where the ray at angle `theta` exits the rounded rect. */
export function roundedRectPoint(halfW: number, halfH: number, r: number, theta: number): Point2 {
  const dx = Math.cos(theta)
  const dy = Math.sin(theta)
  const c = Math.max(0, Math.min(r, halfW, halfH))
  let best = Infinity
  // Straight edges: x = +/-halfW for |y| <= halfH - c, similarly y.
  if (Math.abs(dx) > 1e-12) {
    for (const sx of [-1, 1]) {
      const t = (sx * halfW) / dx
      if (t > 0) {
        const y = t * dy
        if (Math.abs(y) <= halfH - c + 1e-12 && t < best) best = t
      }
    }
  }
  if (Math.abs(dy) > 1e-12) {
    for (const sy of [-1, 1]) {
      const t = (sy * halfH) / dy
      if (t > 0) {
        const x = t * dx
        if (Math.abs(x) <= halfW - c + 1e-12 && t < best) best = t
      }
    }
  }
  // Corner arcs: centers (+/-qx, +/-qy), radius c.
  const qx = halfW - c
  const qy = halfH - c
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = sx * qx
      const cy = sy * qy
      // |(o + t d) - c|^2 = r^2, o = origin.
      const b = dx * -cx + dy * -cy
      const cc = cx * cx + cy * cy - c * c
      const disc = b * b - cc
      if (disc < 0) continue
      const sq = Math.sqrt(disc)
      for (const t of [-b - sq, -b + sq]) {
        if (t <= 0 || t >= best) continue
        // Accept only the arc span, not the full circle: the hit must sit
        // outside both straight-edge bands (the corner region).
        const x = t * dx
        const y = t * dy
        if (Math.abs(x) >= halfW - c - 1e-9 && Math.abs(y) >= halfH - c - 1e-9) best = t
      }
    }
  }
  if (!Number.isFinite(best)) best = Math.min(halfW, halfH)
  return [best * dx, best * dy]
}

/**
 * Full closed loop, 4 * perQuadrant points: theta = 0 at +X, CCW.
 * Same indexing contract as superellipsePoints, so every annulus and
 * slab consumer swaps sources without touching construction.
 */
export function roundedRectPoints(
  halfW: number,
  halfH: number,
  r: number,
  perQuadrant: number,
): Array<[number, number]> {
  const total = perQuadrant * 4
  const pts: Array<[number, number]> = []
  for (let i = 0; i < total; i++) {
    const [x, y] = roundedRectPoint(halfW, halfH, r, (i / total) * Math.PI * 2)
    pts.push([x ?? 0, y ?? 0])
  }
  return pts
}
