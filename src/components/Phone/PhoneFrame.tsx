import { FINISHES, type FinishId } from '../../data/product.ts'
import { cn } from '../../lib/cn.ts'

interface PhoneFrameProps {
  finish?: FinishId
  face?: 'front' | 'rear'
  label?: string
}

/**
 * Static CSS phone renderer for WebGL failure, context loss, and no-JS.
 * Covers front and rear views so every act has a fallback.
 */
export function PhoneFrame({ finish = 'obsidian', face = 'front', label }: PhoneFrameProps) {
  const meta = FINISHES.find((f) => f.id === finish) ?? FINISHES[0]
  return (
    <div
      role="img"
      aria-label={label ?? `Aether One X in ${meta?.name}, ${face} view (static fallback)`}
      className={cn('phone-frame', face === 'rear' && 'phone-frame--rear')}
      data-finish={finish}
      data-face={face}
    >
      {face === 'front' ? (
        <div className="phone-frame-screen">
          <div className="phone-frame-notch" />
          <div className="phone-frame-wallpaper" />
        </div>
      ) : (
        <div className="phone-frame-back">
          <div className="phone-frame-island">
            <span className="phone-frame-lens phone-frame-lens-a" />
            <span className="phone-frame-lens phone-frame-lens-b" />
            <span className="phone-frame-lens phone-frame-lens-c" />
            <span className="phone-frame-module" />
            <span className="phone-frame-range" />
          </div>
          <p className="phone-frame-logo">AETHER</p>
        </div>
      )}
      <style>{`
        .phone-frame { width: 180px; height: 372px; border-radius: 30px; padding: 10px;
          background: ${meta?.swatch ?? '#0b0b0e'}; border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55); }
        .phone-frame-screen { position: relative; width: 100%; height: 100%; border-radius: 22px;
          overflow: hidden; background: #04060c; }
        .phone-frame-notch { position: absolute; top: 10px; left: 50%; width: 64px; height: 8px;
          border-radius: 999px; transform: translateX(-50%); background: #000; }
        .phone-frame-wallpaper { position: absolute; inset: 0;
          background: radial-gradient(120px 200px at 70% 20%, rgba(127,180,255,0.55), transparent 70%),
            linear-gradient(180deg, #0d1c33, #0a1220); }
        .phone-frame-back { position: relative; width: 100%; height: 100%; border-radius: 22px;
          background: ${meta?.swatch ?? '#0b0b0e'}; }
        .phone-frame-island { position: absolute; top: 16px; left: 14px; width: 76px; height: 76px;
          border-radius: 16px; background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.12); }
        .phone-frame-lens { position: absolute; border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, #33507e, #060a12 70%);
          border: 2px solid rgba(200,215,235,0.5); }
        .phone-frame-lens-a { left: 10px; top: 8px; width: 22px; height: 22px; }
        .phone-frame-lens-b { left: 10px; top: 38px; width: 22px; height: 22px; }
        .phone-frame-lens-c { left: 42px; top: 42px; width: 18px; height: 18px; }
        .phone-frame-module { position: absolute; right: 8px; top: 12px; width: 18px; height: 8px;
          border-radius: 4px; background: #eef6ff; }
        .phone-frame-range { position: absolute; right: 12px; bottom: 12px; width: 8px; height: 8px;
          border-radius: 999px; background: #3a0d12; border: 1px solid rgba(255,120,120,0.4); }
        .phone-frame-logo { position: absolute; bottom: 60px; width: 100%; text-align: center;
          font-size: 10px; letter-spacing: 0.5em; color: rgba(240,245,252,0.8); }
      `}</style>
    </div>
  )
}
