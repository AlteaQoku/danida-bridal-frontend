
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Paneli kryesor', path: '/', icon: '⌂' },
  { label: 'Fustanet', path: '/dresses', icon: '♧' },
  { label: 'Rezervimet', path: '/appointments', icon: '▦' },
  { label: 'Klientët', path: '/clients', icon: '♙' },
  { label: 'Mirëmbajtja', path: '/maintenance', icon: '⚒' },
  { label: 'Financa', path: '/finance', icon: '€' },
  { label: 'Raportet', path: '/reports', icon: '▥' },
  { label: 'Cilësimet', path: '/settings', icon: '⚙' },
  { label: 'Kategoritë e fustaneve', path: '/categories', icon: '▤' },
]

function Navbar() {
  const location = useLocation()

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56
      flex-col border-r border-[var(--border)]
      bg-[var(--background)]">

      {/* Logo */}
      <Link
        to="/"
        className="flex h-28 shrink-0 flex-col items-center
          justify-center border-b border-[var(--border)]"
      >
        <img
          src="/logo.png"
          alt="Danida Bridal"
          className="mb-1 h-10 w-10 object-contain"
        />
        <span className="font-serif text-xl uppercase
          tracking-[0.2em] text-[var(--foreground)]">
          Danida
        </span>
        <span className="text-[9px] uppercase
          tracking-[0.2em] text-[var(--text-muted)]">
          Bridal Collection
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-md
              px-3 py-3 text-sm transition-colors
              ${
                isActive(item.path)
                  ? 'bg-[var(--pink-light)] text-[var(--foreground)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--pink-light)]'
              }`}
          >
            <span className="w-5 text-center text-base"
              aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Navbar
