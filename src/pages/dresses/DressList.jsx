import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axiosConfig'


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

function DressImage({ dress }) {
  const [failed, setFailed] = useState(false)

  const src = dress.imageUrl
    ? dress.imageUrl.startsWith('http')
      ? dress.imageUrl
      : `${API_BASE}${dress.imageUrl}`
    : null

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--pink-base)]">
      {src && !failed ? (
        <img
          src={src}
          alt={dress.name}
          loading="lazy"
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.025]"
          onError={() => setFailed(true)}
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
          Ka dëmtim!
        </span>
      )}
    </div>
  )
}

function DressList() {
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/dresses')
      .then(res => setDresses(res.data))
      .catch(err => {
        setError('Fustanet nuk u ngarkuan. Provo përsëri.')
        console.error('Failed to load dresses:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[var(--text-muted)] tracking-wide text-sm animate-pulse">
        Duke ngarkuar koleksionin…
      </p>
    </div>
  )

  if (error) return (
    <div className="border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
      {error}
    </div>
  )

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        
        {/* Page heading */}
        <header className="mb-10 border-b border-[var(--border)] pb-8 text-center">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              DANIDA BRIDAL · KOLEKSIONI
            </p>
            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
              Koleksioni
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {dresses.length} {dresses.length === 1 ? 'fustan' : 'fustane'} në koleksionin tënd
            </p>
          </div>
        </header>

        {/* Empty state */}
        {dresses.length === 0 && (
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
        )}

        {/* Dress grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {dresses.map(dress => (
            <Link
              to={`/dresses/${dress.id}`}
              key={dress.id}
              className="group min-w-0"
            >
              <DressImage dress={dress} />

              {/* Info */}
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
          ))}
        </div>
      </div>
    </main>
  )
}

export default DressList
