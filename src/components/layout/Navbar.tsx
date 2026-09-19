import { Link, NavLink } from 'react-router'
import { Glass } from '../Glass/Glass.tsx'

const LINKS = [
  { to: '/', label: 'Film', end: true },
  { to: '/cameras', label: 'Cameras', end: false },
  { to: '/performance', label: 'Performance', end: false },
  { to: '/display', label: 'Display', end: false },
  { to: '/software', label: 'Software', end: false },
  { to: '/specifications', label: 'Specs', end: false },
]

/** Route-aware floating navbar. A liquid-glass chrome pill, not a full bar. */
export function Navbar() {
  return (
    <header className="sticky top-3 z-40 mx-auto max-w-6xl px-4">
      <Glass variant="chrome" label="Primary">
        <nav aria-label="Primary" className="flex h-12 items-center gap-5 px-5">
          <Link to="/" className="font-display text-sm font-semibold tracking-wide">
            Aether One X
          </Link>
          <ul className="flex flex-wrap items-center gap-4 text-sm">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }: { isActive: boolean }) =>
                    isActive ? 'text-(--color-ink)' : 'text-(--color-dim) hover:text-(--color-ink)'
                  }
                  aria-current={undefined}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a href="/#buy" className="kicker ml-auto hidden sm:block">
            Buy
          </a>
        </nav>
      </Glass>
    </header>
  )
}
