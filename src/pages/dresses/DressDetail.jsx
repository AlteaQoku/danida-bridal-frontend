
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import { ClipboardPlus, AlertTriangle } from 'lucide-react'

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

function DressDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dress, setDress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchDress = async () => {
      try {
        const response = await api.get(`/api/dresses/${id}`)

        if (!cancelled) {
          setDress(response.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Fustani nuk u gjet. Provo përsëri.')
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

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      await api.delete(`/api/dresses/${id}/retire`)
      navigate('/dresses')
    } catch (err) {
      console.error(
        'Failed to delete dress:',
        err.response?.status,
        err.response?.data
      )

      setError(
        err.response?.data?.message ||
        'Fustani nuk u fshi. Provo përsëri.'
      )
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

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

  if (!dress) return null

  // activeDamages comes from DressDetailResponse
  const hasUnresolvedDamage = (dress.activeDamages?.length ?? 0) > 0

  const src = dress.imageUrl
    ? dress.imageUrl.startsWith('http')
      ? dress.imageUrl
      : `${API_BASE}${dress.imageUrl}`
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

        <div className="overflow-hidden border border-[var(--border)] bg-[var(--background)]">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">

            {/* Image section */}
            <div className="relative flex aspect-[3/4] items-center justify-center bg-[var(--pink-base)] lg:aspect-auto">
              {src && !imageFailed ? (
                <img
                  src={src}
                  alt={dress.name}
                  className="max-h-full max-w-full object-contain drop-shadow-lg"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Pa fotografi
                  </span>
                </div>
              )}
            </div>

            {/* Details section */}
            <div className="flex flex-col p-8 lg:p-10">
              <div className="flex-1">

                <div className="mb-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    DANIDA BRIDAL · DETAJET E FUSTANIT
                  </p>

                  <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
                    {dress.name}
                  </h1>

                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {dress.category}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="font-serif text-4xl font-normal tabular-nums sm:text-5xl">
                    €{dress.pricePerRental}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    për qira
                  </p>
                </div>

                {/* Details grid */}
                <div className="mb-8 grid grid-cols-2 border border-[var(--border)]">
                  <div className="border-r border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Madhësia
                    </p>
                    <p className="font-serif text-xl font-normal">
                      {dress.size}
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Ngjyra
                    </p>
                    <p className="font-serif text-xl font-normal">
                      {dress.color}
                    </p>
                  </div>

                  <div className="border-r border-t border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Stoku
                    </p>
                    <p className="font-serif text-xl font-normal tabular-nums">
                      {dress.stock}
                    </p>
                  </div>

                  <div className="border-t border-[var(--border)] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Lokacioni
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--foreground)]">
                      {getLocation(dress)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {dress.description && (
                  <div className="mb-8">
                    <h2 className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Përshkrimi
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--foreground)]">
                      {dress.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
                <Link
                  to={`/dresses/${dress.id}/edit`}
                  className="inline-flex flex-1 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--pink-dark)] sm:text-xs"
                >
                  Ndrysho
                </Link>

                <Link
                  to={`/dresses/${dress.id}/damages/new`}
                  className="inline-flex items-center justify-center gap-2 border border-[var(--border)] px-4 py-3 text-xs text-[var(--foreground)] transition hover:bg-[var(--pink-base)]"
                >
                  <ClipboardPlus size={17} />
                  Raporto dëmtim
                </Link>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center border border-[var(--border)] px-6 py-3 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--pink-base)]"
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Damage warning */}
        {hasUnresolvedDamage && (
          <Link
            to={`/dresses/${dress.id}/damages`}
            className="mt-6 flex items-center gap-3 border border-red-300 bg-red-50 p-4 text-red-700 transition hover:bg-red-100"
          >
            <AlertTriangle size={22} className="shrink-0" />
            <div>
              <p className="font-semibold">Kujdes!</p>
              <p className="text-sm">
                Ky fustan ka dëmtim të pazgjidhur.
                Klikoni për të parë detajet e dëmtimit.
              </p>
            </div>
          </Link>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
              <h2 className="mb-2 font-serif text-xl font-normal">
                Fshi fustanin?
              </h2>

              <p className="mb-6 text-sm text-[var(--text-muted)]">
                A je i sigurt që dëshiron të fshish fustanin "{dress.name}"?
                Ky veprim nuk mund të zhbëhet.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 border border-[var(--border)] px-4 py-3 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--pink-base)] disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-3 text-xs text-white transition-colors hover:bg-[var(--pink-dark)] disabled:opacity-50"
                >
                  {deleting ? 'Duke fshirë...' : 'Fshi'}
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
