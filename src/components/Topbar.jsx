
function Topbar() {
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
          KL
        </div>
        <div className="hidden sm:block">
          <p className="text-sm text-[var(--foreground)]">
            Administratori
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Danida Bridal
          </p>
        </div>
      </div>
    </header>
  )
}

export default Topbar
