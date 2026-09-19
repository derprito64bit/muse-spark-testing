import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const distDir = fileURLToPath(new URL('../dist/', import.meta.url))

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) yield* walk(full)
    else yield full
  }
}

function gzipKb(path) {
  return gzipSync(readFileSync(path)).length / 1024
}

// Placeholder budget check for M0. Full per-chunk accounting lands with the
// film chunks in M3/M4. Fails only on absurd overruns so CI stays meaningful.
console.log('bundle budget check (M0 placeholder)')

try {
  const files = [...walk(distDir)]
  const js = files.filter((f) => f.endsWith('.js'))
  const css = files.filter((f) => f.endsWith('.css'))
  const jsKb = js.reduce((sum, f) => sum + gzipKb(f), 0)
  const cssKb = css.reduce((sum, f) => sum + gzipKb(f), 0)
  console.log(`js total gzip: ${jsKb.toFixed(1)}KB over ${js.length} files`)
  console.log(`css total gzip: ${cssKb.toFixed(1)}KB over ${css.length} files`)
  if (cssKb > 40) throw new Error(`CSS budget exceeded: ${cssKb.toFixed(1)}KB over 40KB`)
  const nonThree = js.filter((f) => !f.includes('three'))
  const nonThreeKb = nonThree.reduce((sum, f) => sum + gzipKb(f), 0)
  console.log(`js excl three gzip: ${nonThreeKb.toFixed(1)}KB`)
  if (nonThreeKb > 180)
    throw new Error(`Initial JS budget exceeded: ${nonThreeKb.toFixed(1)}KB over 180KB`)
  console.log('budgets ok')
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('no dist yet, skipping')
  } else {
    throw err
  }
}
