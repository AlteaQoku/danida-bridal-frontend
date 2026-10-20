
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import {
  ClipboardPlus,
  AlertTriangle,
  LoaderCircle,
  Trash2,
  Shirt,
} from 'lucide-react'

const API_BASE = 'http://localhost:8080'

const LOCATIONS = {
  IN_SALON: 'Në sallon',
  WITH_BRIDE: 'Te nusja',
  IN_CLEANING: 'Në pastrim',
}

function getLocation(dress) {
  return LOCATIONS[dress.location] ?? 'I panjohur'
}

function DressDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dress, setDress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFailed, setImageFailed] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchDress() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/dresses/${id}`)

        if (!cancelled) {
          setDress(response.data)
          setImageFailed(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              'Fustani nuk u gjet. Ju lutem provoni përsëri.'
          )
          console.error('Failed to load dress:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDress()

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    setError('')

    try {
      await api.delete(`/dresses/${id}`)
      navigate('/dresses')
    } catch (err) {
      console.error('Failed to delete dress:', err)

      setError(
        err.response?.data?.message ||
          'Fustani nuk u fshi. Mund të ketë të dhëna të lidhura me të.'
      )
      setShowDeleteModal(false)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <LoaderCircle size={20} className="animate-spin" />
        <p className="text-sm">Duke ngarkuar detajet e fustanit...</p>
      </div>
    )
  }

  if (error && !dress) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl border border-[var(--border)] bg-[var(--background)] p-6">
          <p className="mb-5 text-sm text-red-700">{error}</p>
          <Link
            to="/dresses"
            className="text-sm text-[var(--foreground)] underline underline-offset-4"
          >
            Kthehu te koleksioni
          </Link>
        </div>
      </main>
    )
  }

  if (!dress) return null

  const hasUnresolvedDamage = Boolean(dress.hasUnresolvedDamage)
  const damages = Array.isArray(dress.damages) ? dress.damages : []
  const hasDamageHistory = damages.length > 0

  const imageUrl = dress.imageUrl
    ? dress.imageUrl.startsWith('http')
      ? dress.imageUrl
      : `${API_BASE}${dress.imageUrl.startsWith('/') ? '' : '/'}${dress.imageUrl}`
    : null

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        <Link
          to="/dresses"
          className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Kthehu te koleksioni
        </Link>

        {error && (
          <div
            role="alert"
            className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden border border-[var(--border)] bg-[var(--background)]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative flex aspect-[3/4] items-center justify-center bg-[var(--pink-base)] lg:aspect-auto lg:min-h-[650px]">
              {imageUrl && !imageFailed ? (
                <img
                  src={imageUrl}
                  alt={dress.name}
                  className="max-h-full max-w-full object-contain"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                  <Shirt size={44} strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Pa fotografi
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <div className="flex-1">
                <div className="mb-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    DANIDA BRIDAL · DETAJET E FUSTANIT
                  </p>

                  <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
                    {dress.name}
                  </h1>

                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {dress.categoryName || 'Pa kategori'}
                  </p>
                </div>

                {/* Unresolved damage warning */}
                {hasUnresolvedDamage && (
                  <Link
                    to={`/dresses/${dress.id}/damages`}
                    className="mb-6 flex items-start gap-3 border border-red-300 bg-red-50 p-4 text-red-800 transition-colors hover:bg-red-100"
                  >
                    <AlertTriangle
                      size={22}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="font-semibold">
                        Kujdes: Dëmtim i pazgjidhur
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">
                        Ky fustan ka një ose më shumë dëmtime që nuk janë
                        zgjidhur ende. Klikoni për të parë historikun e
                        dëmtimeve.
                      </p>
                    </div>
                  </Link>
                )}

                {!hasUnresolvedDamage && hasDamageHistory && (
                  <div className="mb-6 border border-[var(--border)] bg-[var(--pink-light)] p-4">
                    <p className="text-sm font-medium">
                      Historiku i dëmtimeve
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Ky fustan ka {damages.length}{' '}
                      {damages.length === 1
                        ? 'raport dëmtimi'
                        : 'raporte dëmtimesh'}{' '}
                      në historik, por nuk ka dëmtime të pazgjidhura.
                    </p>
                    <Link
                      to={`/dresses/${dress.id}/damages`}
                      className="mt-2 inline-block text-sm underline underline-offset-4"
                    >
                      Shiko historikun
                    </Link>
                  </div>
                )}

                {/* Dress details */}
                <div className="mb-8 grid grid-cols-2 border border-[var(--border)]">
                  <div className="border-b border-r border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Madhësia
                    </p>
                    <p className="font-serif text-xl">
                      {dress.size || '—'}
                    </p>
                  </div>

                  <div className="border-b border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Ngjyra
                    </p>
                    <p className="font-serif text-xl">
                      {dress.color || '—'}
                    </p>
                  </div>

                  <div className="border-r border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Sasia totale
                    </p>
                    <p className="font-serif text-xl tabular-nums">
                      {dress.quantity ?? 0}
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Sasia e disponueshme
                    </p>
                    <p className="font-serif text-xl tabular-nums">
                      {dress.availableQuantity ?? 0}
                    </p>
                  </div>

                  <div className="col-span-2 border-t border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Lokacioni
                    </p>
                    <p className="text-xs uppercase tracking-[0.12em]">
                      {getLocation(dress)}
                    </p>

                    {dress.expectedReturnDate && (
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Data e pritshme e kthimit:{' '}
                        {dress.expectedReturnDate}
                      </p>
                    )}
                  </div>

                  {dress.unavailable && (
                    <div className="col-span-2 border-t border-[var(--border)] bg-red-50 p-4 text-sm text-red-700">
                      Ky fustan është shënuar si i padisponueshëm.
                    </div>
                  )}
                </div>

                {dress.description && (
                  <div className="mb-8">
                    <h2 className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Përshkrimi
                    </h2>
                    <p className="text-sm leading-relaxed">
                      {dress.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap">
                <Link
                  to={`/dresses/${dress.id}/edit`}
                  className="inline-flex flex-1 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--pink-dark)]"
                >
                  Ndrysho
                </Link>

                <Link
                  to={`/dresses/${dress.id}/damages/new`}
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-[var(--border)] px-4 py-3 text-xs text-[var(--foreground)] transition hover:bg-[var(--pink-base)]"
                >
                  <ClipboardPlus size={17} />
                  Raporto dëmtim
                </Link>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 border border-[var(--border)] px-5 py-3 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--pink-base)]"
                >
                  <Trash2 size={15} />
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !deleting) {
                setShowDeleteModal(false)
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dress-title"
              className="w-full max-w-md border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
            >
              <h2
                id="delete-dress-title"
                className="mb-2 font-serif text-xl font-normal"
              >
                Fshi fustanin?
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
                A jeni të sigurt që dëshironi të fshini fustanin
                {' "'}{dress.name}{'"'}? Ky veprim nuk mund të zhbëhet.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 border border-[var(--border)] px-4 py-3 text-xs transition-colors hover:bg-[var(--pink-base)] disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-3 text-xs text-white transition-colors hover:bg-[var(--pink-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <LoaderCircle size={15} className="animate-spin" />
                      Duke fshirë...
                    </span>
                  ) : (
                    'Fshi fustanin'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default DressDetail