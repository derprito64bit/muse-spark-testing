// Single-command visual verification. Headless system Chrome + SwiftSheet.
// Covers every view a human must eyeball after device/film changes, so no
// ad-hoc screenshot one-liners: `node scripts/m3r-shots.mjs` (preview must
// already serve the current dist on 4173).
import { chromium } from 'playwright-core'

const SHOTS = [
  { name: 'buy-obsidian', url: 'http://127.0.0.1:4173/#buy', finish: 'obsidian' },
  { name: 'buy-ember', url: 'http://127.0.0.1:4173/#buy', finish: 'ember' },
  { name: 'buy-glacier', url: 'http://127.0.0.1:4173/#buy', finish: 'glacier' },
  { name: 'film-arrival', url: 'http://127.0.0.1:4173/?t=0.02' },
  { name: 'film-macro-hold', url: 'http://127.0.0.1:4173/?t=0.69' },
  { name: 'film-xray-mid', url: 'http://127.0.0.1:4173/?t=0.31' },
  { name: 'film-approach-port', url: 'http://127.0.0.1:4173/?t=0.249' },
  { name: 'film-final', url: 'http://127.0.0.1:4173/?t=0.99' },
  { name: 'page-rear', url: 'http://127.0.0.1:4173/cameras' },
]

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'],
})
for (const shot of SHOTS) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto(shot.url, { waitUntil: 'load' })
  if (shot.finish !== undefined) {
    await page.waitForSelector('[data-testid="phone-viewer"]', { timeout: 30000 })
    await page.getByTestId('phone-viewer').first().scrollIntoViewIfNeeded()
    await page.waitForSelector('[data-testid="phone-canvas"]', { timeout: 30000 })
    await page.getByTestId(`finish-${shot.finish}`).click()
  } else if (shot.name === 'page-rear') {
    await page.waitForSelector('[data-testid="phone-viewer"]', { timeout: 30000 })
    await page.getByTestId('phone-viewer').first().scrollIntoViewIfNeeded()
    await page.waitForSelector('[data-testid="phone-canvas"]', { timeout: 30000 })
  } else {
    await page.waitForSelector('[data-testid="film-chapter"]', { timeout: 30000 })
  }
  // Settle entrance motion, finish lerp, and film damping.
  await page.waitForTimeout(5000)
  if (shot.finish === undefined && shot.name !== 'page-rear') {
    // Re-scroll against settled layout: the mount-time ?t= mapping runs
    // before lazy chunks and fonts stop shifting the runway height, so it
    // lands short. Second mapping is exact.
    await page.evaluate(() => {
      const runway = document.querySelector('[data-testid="film-runway"]')
      if (runway === null) return
      const rect = runway.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const t = Number.parseFloat(new URLSearchParams(window.location.search).get('t') ?? '0')
      window.scrollTo({ top: top + t * (rect.height - window.innerHeight), behavior: 'instant' })
    })
    await page.waitForTimeout(3000)
  }
  await page.screenshot({ path: `docs/film-snaps/m3r-${shot.name}.png` })
  console.log(`captured ${shot.name} (pageerrors: ${errors.length})`)
  for (const e of errors) console.log(e)
  await context.close()
}
await browser.close()
