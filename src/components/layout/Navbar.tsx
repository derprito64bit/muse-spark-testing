import { Link, NavLink } from 'react-router'

const LINKS = [
  { to: '/', label: 'Film', end: true },
  { to: '/cameras', label: 'Cameras', end: false },
  { to: '/performance', label: 'Performance', end: false },
  { to: '/display', label: 'Display', end: false },
  { to: '/software', label: 'Software', end: false },
  { to: '/specifications', label: 'Specs', end: false },
]

/** Route-aware sticky navbar. Glass chrome lands in M6; solid surface until then. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border-hairline) bg-(--color-scrim) backdrop-blur-md">
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
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
    </header>
  )
}
