import { useState } from 'react'
import { DEFAULT_STORAGE_GB, FINISHES, STORAGE_OPTIONS } from '../../data/product.ts'
import { formatPrice } from '../../lib/format.ts'
import { Glass } from '../Glass/Glass.tsx'
import { FINISH_PARAMS } from '../PhoneViewer/phoneMaterials.ts'
import { PhoneConfigProvider, usePhoneConfig } from '../PhoneViewer/PhoneConfig.tsx'
import { PhoneViewer } from '../PhoneViewer/PhoneViewer.tsx'

/**
 * Closing configurator deck. Finish and capacity lerp the live 3D materials
 * through shared config; the sticky summary bar carries price and CTA.
 */
export function BuyDeck() {
  return (
    <PhoneConfigProvider>
      <BuyDeckInner />
    </PhoneConfigProvider>
  )
}

function BuyDeckInner() {
  const { finish, setFinish } = usePhoneConfig()
  const [storageGb, setStorageGb] = useStateGb()
  const option = STORAGE_OPTIONS.find((s) => s.gb === storageGb) ?? STORAGE_OPTIONS[1]
  const active = FINISHES.find((f) => f.id === finish) ?? FINISHES[0]
  if (option === undefined || active === undefined) return null
  const accent = FINISH_PARAMS[finish]?.uiAccent ?? '#7fb4ff'

  return (
    <section
      id="buy"
      tabIndex={-1}
      aria-label="Configure your Aether One X"
      className="mx-auto max-w-6xl px-4 py-16"
    >
      <Glass variant="panel" label="Configurator">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <PhoneViewer pose="hero" label={`Aether One X in ${active.name}`} sharedConfig />
          </div>
          <div>
            <p className="kicker">Configure</p>
            <h2 className="spec-num mt-3 text-4xl md:text-5xl">Make it yours.</h2>
            <h3 className="spec-tech mt-6">Finish</h3>
            <div role="group" aria-label="Choose a finish" className="mt-2 flex gap-3">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  aria-pressed={finish === f.id}
                  aria-label={f.name}
                  title={`${f.name}: ${f.tagline}`}
                  data-testid={`finish-${f.id}`}
                  data-active={finish === f.id}
                  className="h-12 w-12 rounded-full border-2 border-transparent"
                  style={{
                    background: f.swatch,
                    borderColor: finish === f.id ? accent : 'transparent',
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-(--color-dim)" data-testid="finish-name">
              {active.name}: {active.tagline}
            </p>
            <span
              aria-hidden="true"
              data-testid="finish-underline"
              className="mt-1 block h-0.5 w-16 rounded-full"
              style={{ background: accent }}
            />
            <h3 className="spec-tech mt-6">Capacity</h3>
            <div role="group" aria-label="Choose a capacity" className="mt-2 flex flex-wrap gap-2">
              {STORAGE_OPTIONS.map((s) => (
                <button
                  key={s.gb}
                  type="button"
                  onClick={() => setStorageGb(s.gb)}
                  aria-pressed={storageGb === s.gb}
                  data-testid={`capacity-${s.gb}`}
                  data-active={storageGb === s.gb}
                  className="min-h-11 rounded-full border border-(--color-border-hairline) px-5 text-sm text-(--color-dim) data-[active=true]:bg-(--color-elev) data-[active=true]:text-(--color-ink)"
                >
                  {s.label} · {formatPrice(s.price)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-4 mx-8 mb-8 flex items-center justify-between rounded-full border border-(--color-border-hairline) bg-(--color-surface)/85 px-6 py-3 backdrop-blur-md md:mx-12">
          <p className="text-sm text-(--color-dim)">
            {active.name} · {option.label}
          </p>
          <p className="flex items-center gap-4">
            <span className="spec-num text-2xl" data-testid="buy-price">
              {formatPrice(option.price)}
            </span>
            <span className="rounded-full bg-(--color-aether-strong) px-5 py-2 text-sm font-semibold text-(--color-ink-inverse)">
              Buy
            </span>
          </p>
        </div>
      </Glass>
    </section>
  )
}

function useStateGb(): [number, (gb: number) => void] {
  const [gb, setGb] = useState<number>(DEFAULT_STORAGE_GB)
  return [
    gb,
    (next: number) => {
      if (STORAGE_OPTIONS.some((s) => s.gb === next)) setGb(next)
    },
  ]
}
