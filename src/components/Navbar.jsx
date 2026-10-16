import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/dresses') {
      return location.pathname === '/dresses'
    }

    return location.pathname === path
  }

  const navLinkClass = (path) =>
    `border-b pb-1 text-xs uppercase tracking-[0.15em] transition-colors duration-200 ${
      isActive(path)
        ? 'border-[var(--pink-dark)] text-[var(--foreground)]'
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
    }`

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)] px-5 py-5 sm:px-8 lg:px-14">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src="/logo.png"
            alt="Danida Bridal"
            className="h-12 w-12 object-contain"
          />
        
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-normal uppercase tracking-[0.2em] text-[var(--foreground)] sm:text-2xl">
              Danida
            </h1>
          
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Bridal Collection
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          <Link
            to="/dresses"
            className={navLinkClass('/dresses')}
          >
            Fustanet
          </Link>

          <Link
            to="/appointments"
            className={navLinkClass('/appointments')}
          >
            Takimet
          </Link>

          <Link
            to="/dresses/create"
            className="inline-flex items-center gap-2 bg-[var(--foreground)] px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-[var(--pink-dark)] hover:text-[var(--foreground)] sm:px-5 sm:text-xs"
          >
            <span aria-hidden="true">+</span>
            <span>Shto fustan</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
