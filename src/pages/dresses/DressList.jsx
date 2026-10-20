
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
  const value = dress.location ?? dress.currentLocation
  const status = typeof value === 'string' ? value : value?.status

  return LOCATIONS[status] ?? LOCATIONS.UNKNOWN
}

function getErrorMessage(error) {
  const status = error?.response?.status
  const data = error?.response?.data

  if (!error?.response) {
    return 'Nuk mund të lidhemi me serverin. Kontrolloni nëse backend-i është aktiv.'
  }

  const message =
    typeof data === 'string'
      ? data
      : data?.message || data?.detail || data?.error

  if (status === 400) {
    return message || 'Kërkesa për listën e fustaneve nuk është e vlefshme.'
  }

  if (status === 401 || status === 403) {
    return 'Nuk keni leje për të parë koleksionin. Kontrolloni autentikimin tuaj.'
  }

  if (status === 404) {
    return 'Adresa e listës së fustaneve nuk u gjet. Kontrolloni endpoint-in e API-së.'
  }

  if (status >= 500) {
    return 'Serveri pati një gabim gjatë ngarkimit të fustaneve. Kontrolloni log-et e backend-it.'
  }

  return message || 'Fustanet nuk u ngarkuan. Provoni përsëri.'
}

function getDressList(data) {
  if (Array.isArray(data)) {
    return {
      dresses: data,
      totalPages: 1,
      currentPage: 0,
      isPaged: false,
    }
  }

  if (Array.isArray(data?.content)) {
    return {
      dresses: data.content,
      totalPages: Number(data.totalPages) || 1,
      currentPage: Number(data.number) || 0,
      isPaged: true,
    }
  }

  return null
}

function DressImage({ dress }) {
  const [failed, setFailed] = useState(false)

  const src = dress.imageUrl
    ? dress.imageUrl.startsWith('http')
      ? dress.imageUrl
      : `${API_BASE}${dress.imageUrl.startsWith('/') ? '' : '/'}${dress.imageUrl}`
    : null

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--pink-base)]">
      {src && !failed ? (
        <img
          src={src}
          alt={dress.name || 'Fustan nusërie'}
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

      {dress.hasUnresolvedDamage && (
        <span className="absolute left-3 top-3 bg-[var(--background)] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--foreground)]">
          Ka dëmtim
        </span>
      )}

      {dress.unavailable && (
        <span className="absolute right-3 top-3 bg-[var(--background)] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--foreground)]">
          I padisponueshëm
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
    let active = true

    async function loadAllDresses() {
      setLoading(true)
      setError(null)

      try {
        // Request the first page. Spring Data uses zero-based page numbers.
        const firstResponse = await api.get('/dresses', {
          params: { page: 0, size: 100 },
        })

        const firstPage = getDressList(firstResponse.data)

        if (!firstPage) {
          throw new Error(
            'Përgjigjja e serverit nuk përmban një listë të vlefshme fustanesh.'
          )
        }

        let allDresses = [...firstPage.dresses]

        // If Spring returned a Page, request any remaining pages too.
        if (firstPage.isPaged && firstPage.totalPages > 1) {
          const remainingPages = []

          for (
            let page = firstPage.currentPage + 1;
            page < firstPage.totalPages;
            page++
          ) {
            remainingPages.push(
              api.get('/dresses', {
                params: { page, size: 100 },
              })
            )
          }

          const responses = await Promise.all(remainingPages)

          for (const response of responses) {
            const pageData = getDressList(response.data)

            if (!pageData) {
              throw new Error(
                'Serveri ktheu një format të pavlefshëm për një nga faqet e koleksionit.'
              )
            }

            allDresses = allDresses.concat(pageData.dresses)
          }
        }

        if (active) {
          setDresses(allDresses)
        }
      } catch (err) {
        console.error('Failed to load dresses:', err)

        if (active) {
          setError(
            err.message && !err.response
              ? err.message
              : getErrorMessage(err)
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAllDresses()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-sm tracking-wide text-[var(--text-muted)]">
          Duke ngarkuar koleksionin…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8 lg:px-14">
        <div
          role="alert"
          className="mx-auto max-w-3xl border border-[var(--border)] bg-[var(--background)] px-5 py-5"
        >
          <h2 className="font-serif text-xl">Koleksioni nuk u ngarkua</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 border border-[var(--pink-dark)] px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-[var(--pink-base)]"
          >
            Provo përsëri
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        <header className="mb-10 border-b border-[var(--border)] pb-8 text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
            DANIDA BRIDAL · KOLEKSIONI
          </p>

          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            Koleksioni
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {dresses.length}{' '}
            {dresses.length === 1 ? 'fustan' : 'fustane'} në koleksionin tuaj
          </p>
        </header>

        {dresses.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--background)] px-6 py-16 text-center">
            <h2 className="mb-3 font-serif text-2xl">
              Koleksioni juaj fillon këtu
            </h2>

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
            {dresses.map((dress) => (
              <Link
                to={`/dresses/${dress.id}`}
                key={dress.id}
                className="group min-w-0"
              >
                <DressImage dress={dress} />

                <div className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl font-normal transition-colors group-hover:text-[var(--pink-dark)] sm:text-2xl">
                        {dress.name}
                      </h2>

                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {[
                          dress.categoryName,
                          dress.size,
                          dress.color,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {getLocation(dress)}
                    </span>

                    <span className="text-xs text-[var(--text-muted)]">
                      Gjithsej: {dress.quantity ?? 0}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--text-muted)]">
                      Të disponueshëm: {dress.availableQuantity ?? 0}
                    </span>

                    {dress.expectedReturnDate && (
                      <span className="text-right text-xs text-[var(--text-muted)]">
                        Kthimi: {dress.expectedReturnDate}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default DressList
