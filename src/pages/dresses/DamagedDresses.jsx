import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import api from '../../api/axiosConfig'

const API_BASE = 'http://localhost:8080'

function DamagedDresses() {
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/dresses')
      .then(res => {
        const damagedDresses = res.data.filter(d => d.hasDamage)
        setDresses(damagedDresses)
      })
      .catch(err => {
        setError('Dëmtimet nuk u ngarkuan. Provo përsëri.')
        console.error('Failed to load damaged dresses:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-sm tracking-wide text-[var(--text-muted)]">
          Duke ngarkuar…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
        {error}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        {/* Page heading */}
        <header className="mb-8 border-b border-[var(--border)] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              DANIDA BRIDAL · DËMTIMET
            </p>
          </div>

          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            Fustane me dëmtim
          </h1>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            {dresses.length === 0
              ? 'Nuk ka fustane me dëmtim të pazgjidhur.'
              : `${dresses.length} fustan(e) me dëmtim të pazgjidhur`}
          </p>
        </header>

        {dresses.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--background)] px-6 py-16 text-center">
            <AlertTriangle className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="mb-3 font-serif text-2xl">
              Të gjitha fustanet janë në gjendje të mirë
            </h3>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Nuk ka dëmtime të pazgjidhur në koleksion.
            </p>
            <Link
              to="/dresses"
              className="inline-block border border-[var(--pink-dark)] px-6 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-[var(--pink-base)]"
            >
              Shiko koleksionin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dresses.map(dress => {
              const src = dress.imageUrl
                ? dress.imageUrl.startsWith('http')
                  ? dress.imageUrl
                  : `${API_BASE}${dress.imageUrl}`
                : null

              return (
                <Link
                  to={`/dresses/${dress.id}/damages`}
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

                    <span className="absolute left-3 top-3 flex items-center gap-2 bg-red-600 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-white">
                      <AlertTriangle size={12} />
                      Ka dëmtim!
                    </span>
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
                      <span className="text-[10px] uppercase tracking-[0.12em] text-red-600">
                        Kërkon vëmendje
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
      </div>
    </main>
  )
}

export default DamagedDresses
