// One-shot raycast probe: reports what renders at given canvas fractions.
// Usage: node scripts/probe.mjs <url> <fx,fy>...  (fx,fy in 0..1 of canvas)
// Single-viewer pages only (ray hits the last-mounted scene otherwise).
import { chromium } from 'playwright-core'

const [url, ...pts] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'],
})
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
await page.goto(url, { waitUntil: 'load' })
// NDC fractions are canvas-relative; caller picks points on the visible phone.
await page.waitForTimeout(8000)
for (const pt of pts) {
  const [fx, fy] = pt.split(',').map(Number)
  const hit = await page.evaluate(
    ([x, y]) => (typeof window.__ray === 'function' ? window.__ray(x, y) : 'no-ray'),
    [fx * 2 - 1, -(fy * 2 - 1)],
  )
  console.log(`--- ${pt}\n${hit}`)
}
await browser.close()
