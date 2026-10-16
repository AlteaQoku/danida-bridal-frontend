import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import api from '../api/axiosConfig'

const API_BASE = 'http://localhost:8080'

const LOCATIONS = {
  IN_SALON: 'Në sallon',
  WITH_BRIDE: 'Te nusja',
  IN_CLEANING: 'Në pastrim',
  UNKNOWN: 'I panjohur',
}

function getLocation(dress) {
  const value = dress.currentLocation
  const status = typeof value === 'string' ? value : value?.status
  return LOCATIONS[status] ?? LOCATIONS.UNKNOWN
}

function Dashboard() {
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dresses')
      .then(res => setDresses(res.data))
      .catch(err => console.error('Failed to load dresses:', err))
      .finally(() => setLoading(false))
  }, [])

  const totalDresses = dresses.length

  const inSalon = dresses.filter(
    d => getLocation(d) === LOCATIONS.IN_SALON
  ).length

  const withBride = dresses.filter(
    d => getLocation(d) === LOCATIONS.WITH_BRIDE
  ).length

  const inCleaning = dresses.filter(
    d => getLocation(d) === LOCATIONS.IN_CLEANING
  ).length

  const damaged = dresses.filter(d => d.hasDamage).length

  const stats = [
    { label: 'Fustane gjithsej', value: totalDresses },
    { label: 'Në sallon', value: inSalon },
    { label: 'Te nusja', value: withBride },
    { label: 'Në pastrim', value: inCleaning },
    { label: 'Me dëmtim', value: damaged, isAlert: true },
  ]

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">

        {/* Page heading */}
        <header className="flex flex-col gap-6 border-b border-[var(--border)] pb-8 text-center sm:text-center">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              DANIDA BRIDAL · MENAXHIMI I ATELIERIT
            </p>

            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
              Mirë se vini
            </h1>
          </div>
        </header>

        {/* Statistics */}
        <section
          className="pt-10 lg:pt-14"
          aria-labelledby="overview-title"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Përmbledhje
              </p>

              <h2
                id="overview-title"
                className="font-serif text-2xl font-normal sm:text-3xl"
              >
                Gjendja e koleksionit
              </h2>
            </div>

            <span className="text-xs text-[var(--text-muted)]">
              {loading ? 'Duke ngarkuar…' : 'Të dhënat aktuale'}
            </span>
          </div>

          <div className="grid grid-cols-2 border border-[var(--border)] bg-[var(--background)] lg:grid-cols-5">
            {stats.map((stat, index) => (
              stat.isAlert && !loading && stat.value > 0 ? (
                <Link
                  key={stat.label}
                  to="/dresses/damaged"
                  className={`
                    p-5 sm:p-7 lg:p-8 transition hover:bg-red-100
                    ${index % 2 !== 0 ? 'border-l border-[var(--border)]' : ''}
                    ${index >= 2 ? 'border-t border-[var(--border)] lg:border-t-0' : ''}
                    ${index === 2 ? 'lg:border-l-0' : ''}
                    ${index === 3 ? 'lg:border-l lg:border-[var(--border)]' : ''}
                    ${index === 4 ? 'lg:border-l lg:border-[var(--border)]' : ''}
                    border-red-300 bg-red-50
                  `}
                >
                  <p className="mb-5 text-[10px] uppercase tracking-[0.15em] text-red-700 sm:text-xs">
                    <AlertTriangle size={14} className="mr-1 inline-flex" />
                    {stat.label}
                  </p>

                  <p className="font-serif text-4xl font-normal tabular-nums text-red-700 sm:text-5xl">
                    {stat.value}
                  </p>

                  <p className="mt-4 text-xs text-red-700">
                    Shiko të gjitha
                    <span className="ml-1 text-lg">→</span>
                  </p>
                </Link>
              ) : (
                <div
                  key={stat.label}
                  className={`
                    p-5 sm:p-7 lg:p-8
                    ${index % 2 !== 0 ? 'border-l border-[var(--border)]' : ''}
                    ${index >= 2 ? 'border-t border-[var(--border)] lg:border-t-0' : ''}
                    ${index === 2 ? 'lg:border-l-0' : ''}
                    ${index === 3 ? 'lg:border-l lg:border-[var(--border)]' : ''}
                    ${index === 4 ? 'lg:border-l lg:border-[var(--border)]' : ''}
                    ${stat.isAlert ? 'border-red-300 bg-red-50' : ''}
                  `}
                >
                  <p className={`mb-5 text-[10px] uppercase tracking-[0.15em] sm:text-xs ${stat.isAlert ? 'text-red-700' : 'text-[var(--text-muted)]'}`}>
                    {stat.isAlert && (
                      <AlertTriangle size={14} className="mr-1 inline-flex" />
                    )}
                    {stat.label}
                  </p>

                  <p className={`font-serif text-4xl font-normal tabular-nums sm:text-5xl ${stat.isAlert ? 'text-red-700' : ''}`}>
                    {loading ? '—' : stat.value}
                  </p>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Recent dresses */}
        <section
          className="pt-14 lg:pt-20"
          aria-labelledby="recent-title"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Përzgjedhje
              </p>

              <h2
                id="recent-title"
                className="font-serif text-3xl font-normal sm:text-4xl"
              >
                Fustanet e fundit
              </h2>
            </div>

            <Link
              to="/dresses"
              className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--pink-dark)]"
            >
              Shiko koleksionin <span className="ml-1">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[var(--text-muted)]">
              Duke ngarkuar koleksionin…
            </div>
          ) : dresses.length === 0 ? (
            <div className="border border-[var(--border)] bg-[var(--background)] px-6 py-16 text-center">
              <h3 className="mb-3 font-serif text-2xl">
                Koleksioni juaj fillon këtu
              </h3>

              <p className="mb-6 text-sm text-[var(--text-muted)]">
                Shtoni fustanin e parë për të filluar organizimin e koleksionit.
              </p>

              <Link
                to="/dresses/create"
                className="inline-block border border-[var(--pink-dark)] px-6 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-[var(--pink-base)]"
              >
                Shto fustan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {dresses.slice(0, 6).map(dress => {
                const src = dress.imageUrl
                  ? dress.imageUrl.startsWith('http')
                    ? dress.imageUrl
                    : `${API_BASE}${dress.imageUrl}`
                  : null

                return (
                  <Link
                    to={`/dresses/${dress.id}`}
                    key={dress.id}
                    className="group min-w-0"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--pink-base)]">
                      {src ? (
                        <img
                          src={src}
                          alt={dress.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.025]"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Pa fotografi
                          </span>
                        </div>
                      )}

                      {dress.hasDamage && (
                        <span className="absolute left-3 top-3 bg-[var(--background)] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--foreground)]">
                          Kërkon vëmendje
                        </span>
                      )}
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-serif text-xl font-normal transition-colors group-hover:text-[var(--pink-dark)] sm:text-2xl">
                            {dress.name}
                          </h3>

                          <p className="mt-2 text-xs text-[var(--text-muted)]">
                            {[dress.category, dress.size, dress.color]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>

                        <p className="whitespace-nowrap pt-1 text-sm">
                          €{dress.pricePerRental}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {getLocation(dress)}
                        </span>

                        <span className="text-xs text-[var(--text-muted)]">
                          Stoku: {dress.stock}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col gap-2 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between lg:mt-24">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            DANIDA BRIDAL
          </p>

          <p className="text-xs text-[var(--text-muted)]">
            Elegancë në çdo detaj.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default Dashboard
