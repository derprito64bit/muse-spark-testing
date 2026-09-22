import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

/**
 * No scroll listeners in app code (invariant 2: scroll values never enter
 * React state). Scroll position reaches the film through MotionValues
 * (useScroll) and card/overlay updates through useMotionValueEvent.
 */
describe('no scroll listeners', () => {
  it('calls addEventListener with scroll nowhere under src', () => {
    const hits: string[] = []
    for (const file of walk('src')) {
      if (!/\.(tsx?|css)$/.test(file)) continue
      if (file.endsWith('no-scroll-listener.test.ts')) continue
      const content = readFileSync(file, 'utf8')
      if (/addEventListener\s*\(\s*['"]scroll['"]/.test(content)) hits.push(file)
    }
    expect(hits).toEqual([])
  })
})
