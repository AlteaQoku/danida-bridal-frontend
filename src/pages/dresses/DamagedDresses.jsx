
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  LoaderCircle,
  Shirt,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react'
import api from '../../api/axiosConfig'

const API_BASE = 'http://localhost:8080'

function getImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl

  return `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

function DamagedDresses() {
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchDamagedDresses() {
      try {
        setLoading(true)
        setError('')

        const firstResponse = await api.get('/dresses', {
          params: { page: 0, size: 100 },
        })

        const firstPage = firstResponse.data
        let allDresses = Array.isArray(firstPage)
          ? firstPage
          : firstPage.content ?? []

        // Load additional pages if the API returns a Spring Page.
        if (
          !Array.isArray(firstPage) &&
          firstPage.totalPages > 1
        ) {
          const remainingPages = await Promise.all(
            Array.from(
              { length: firstPage.totalPages - 1 },
              (_, index) =>
                api.get('/dresses', {
                  params: { page: index + 1, size: 100 },
                })
            )
          )

          allDresses = [
            ...allDresses,
            ...remainingPages.flatMap((response) =>
              Array.isArray(response.data)
                ? response.data
                : response.data.content ?? []
            ),
          ]
        }

        if (!cancelled) {
          setDresses(
            allDresses.filter((dress) => dress.hasUnresolvedDamage)
          )
        }
      } catch (err) {
        console.error('Failed to load damaged dresses:', err)

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              'Dëmtimet nuk u ngarkuan. Ju lutem provoni përsëri.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDamagedDresses()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <LoaderCircle size={20} className="animate-spin" />
        <span>Duke ngarkuar fustanet me dëmtime...</span>
      </div>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8">
        <div
          role="alert"
          className="mx-auto max-w-3xl border border-red-200 bg-[var(--background)] p-5 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-2 underline underline-offset-4"
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
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={15} />
          Kthehu te paneli
        </Link>

        <header className="mb-8 border-b border-[var(--border)] pb-8">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              DANIDA BRIDAL · MENAXHIMI I DËMTIMEVE
            </p>
          </div>

          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            Fustane me dëmtime
          </h1>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Shikoni fustanet që kanë dëmtime të pazgjidhura dhe hapni
            historikun e tyre për më shumë informacion.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <AlertTriangle size={19} />
            <span className="text-sm">
              <strong>{dresses.length}</strong>{' '}
              {dresses.length === 1
                ? 'fustan kërkon vëmendje'
                : 'fustane kërkojnë vëmendje'}
            </span>
          </div>
        </header>

        {dresses.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--background)] px-6 py-16 text-center">
            <Shirt
              className="mx-auto mb-4 text-[var(--text-muted)]"
              size={44}
              strokeWidth={1.2}
            />

            <h2 className="mb-3 font-serif text-2xl">
              Nuk ka dëmtime të pazgjidhura
            </h2>

            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Aktualisht nuk ka fustane që kërkojnë vëmendje.
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
            {dresses.map((dress) => {
              const src = getImageUrl(dress.imageUrl)

              return (
                <article
                  key={dress.id}
                  className="group min-w-0 overflow-hidden border border-[var(--border)] bg-[var(--background)]"
                >
                  <Link
                    to={`/dresses/${dress.id}/damages`}
                    className="block"
                    aria-label={`Shiko dëmtimet e fustanit ${dress.name}`}
                  >
                    <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[var(--pink-base)]">
                      {src ? (
                        <img
                          src={src}
                          alt={dress.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.025]"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                          <Shirt size={42} strokeWidth={1.2} />
                          <span className="text-[10px] uppercase tracking-[0.2em]">
                            Pa fotografi
                          </span>
                        </div>
                      )}

                      <span className="absolute left-3 top-3 flex items-center gap-2 bg-red-600 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-white">
                        <AlertTriangle size={13} />
                        Dëmtim i pazgjidhur
                      </span>
                    </div>
                  </Link>

                  <div className="p-4">
                    <h2 className="truncate font-serif text-xl sm:text-2xl">
                      {dress.name}
                    </h2>

                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {[
                        dress.categoryName,
                        dress.size ? `Madhësia ${dress.size}` : null,
                        dress.color,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Pa detaje shtesë'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 border-y border-[var(--border)] py-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          Sasia totale
                        </p>
                        <p className="mt-1 font-serif text-lg">
                          {dress.quantity ?? 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          E disponueshme
                        </p>
                        <p className="mt-1 font-serif text-lg">
                          {dress.availableQuantity ?? 0}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/dresses/${dress.id}/damages`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.1em] text-white transition hover:bg-[var(--pink-dark)]"
                    >
                      <ClipboardList size={16} />
                      Shiko dëmtimet
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default DamagedDresses
