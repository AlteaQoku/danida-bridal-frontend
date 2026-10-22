import { KeyRound, LogOut, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
function Topbar() {
  const { user, logout } = useAuth()

  const displayName = user?.fullName || user?.username || ''
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-30 flex h-[72px]
      items-center justify-between gap-4 border-b
      border-[var(--border)] bg-[var(--background)]
      px-5 sm:px-8">

      <div className="relative w-full max-w-xl">
        <input
          type="search"
          placeholder="Kërko fustan, klient ose kod..."
          className="w-full rounded-full border
            border-[var(--border)] bg-transparent
            py-3 pl-11 pr-4 text-sm outline-none
            focus:border-[var(--pink-dark)]"
        />
        <span className="absolute left-4 top-1/2
          -translate-y-1/2 text-[var(--text-muted)]">
          ⌕
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center
          justify-center rounded-full bg-[var(--pink-light)]
          font-serif text-sm text-[var(--foreground)]">
          {initials}
        </div>

        <div className="hidden sm:block">
          <p className="text-sm text-[var(--foreground)]">
            {displayName}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Danida Bridal
          </p>
        </div>
        {user?.admin && (
          <Link
            to="/employees"
            title="Punonjësit"
            className="ml-2 flex items-center gap-2 rounded-lg border
            border-[var(--border)] px-3 py-1.5 text-sm
           text-[var(--foreground)] transition
          hover:bg-[var(--pink-light)]"
  >
    <Users size={16} />
    <span className="hidden lg:inline">Punonjësit</span>
  </Link>
)}
        <Link
          to="/change-password"
          title="Ndrysho fjalëkalimin"
          className="ml-2 flex items-center gap-2 rounded-lg border
            border-[var(--border)] px-3 py-1.5 text-sm
            text-[var(--foreground)] transition
            hover:bg-[var(--pink-light)]"
        >
          <KeyRound size={16} />
          <span className="hidden lg:inline">Fjalëkalimi</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="ml-2 flex items-center gap-2 rounded-lg border
            border-[var(--border)] px-3 py-1.5 text-sm
            text-[var(--foreground)] transition
            hover:bg-[var(--pink-light)]"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Dil</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar