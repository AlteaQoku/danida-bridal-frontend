
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import api from '../../api/axiosConfig'

function DressDamages() {
  const { id } = useParams()

  const [dress, setDress] = useState(null)
  const [damages, setDamages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingIds, setUpdatingIds] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadDamages = async () => {
      try {
        const [dressResponse, damagesResponse] = await Promise.all([
          api.get(`/api/dresses/${id}`),
          api.get(`/api/dresses/${id}/damages`),
        ])

        if (cancelled) return

        setDress(dressResponse.data)
        setDamages(
          Array.isArray(damagesResponse.data)
            ? damagesResponse.data
            : []
        )
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load dress damages:', err)
          setError('Dëmtimet nuk mund të ngarkoheshin.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDamages()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleResolutionChange = async (damage, resolved) => {
    setUpdatingIds((current) => [...current, damage.id])
    setError('')

    try {
      const response = await api.patch(
        `/api/dresses/${id}/damages/${damage.id}`,
        null,
        { params: { resolved } }
      )

      setDamages((current) =>
        current.map((item) =>
          item.id === damage.id ? response.data : item
        )
      )
    } catch (err) {
      console.error('Failed to update damage:', err)
      setError('Statusi i dëmtimit nuk u ruajt. Provo përsëri.')
    } finally {
      setUpdatingIds((current) =>
        current.filter((damageId) => damageId !== damage.id)
      )
    }
  }

  if (loading) {
    return <div className="p-8">Duke ngarkuar dëmtimet…</div>
  }

  if (error && !dress) {
    return <div className="p-8 text-red-700">{error}</div>
  }

  const unresolvedCount = damages.filter(
    (damage) => !damage.resolved
  ).length

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Link
          to={`/dresses/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={17} />
          Kthehu te fustani
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            DANIDA BRIDAL
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl">
            Dëmtimet e fustanit
          </h1>

          {dress && (
            <p className="mt-2 text-[var(--text-muted)]">
              {dress.name}
            </p>
          )}

          <p className="mt-4 text-sm">
            {unresolvedCount === 0
              ? 'Të gjitha dëmtimet janë zgjidhur.'
              : `${unresolvedCount} dëmtim(e) të pazgjidhur`}
          </p>
        </header>

        {error && (
          <p role="alert" className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {damages.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--background)] p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-green-600" size={32} />
            <p>Nuk ka dëmtime të raportuara për këtë fustan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {damages.map((damage) => {
              const resolved = damage.resolved

              return (
                <article
                  key={damage.id}
                  className={`border bg-[var(--background)] p-5 sm:p-6 ${
                    resolved
                      ? 'border-[var(--border)]'
                      : 'border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={resolved}
                      disabled={updatingIds.includes(damage.id)}
                      onChange={(event) =>
                        handleResolutionChange(
                          damage,
                          event.target.checked
                        )
                      }
                      aria-label={`Shëno dëmtimin ${damage.id} si të zgjidhur`}
                      className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-green-600 disabled:cursor-wait"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          Dëmtimi #{damage.id}
                        </h2>

                        <span
                          className={`text-xs ${
                            resolved ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {resolved ? 'I zgjidhur' : 'I pazgjidhur'}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {damage.description}
                      </p>

                      <div className="mt-4 space-y-1 text-xs text-[var(--text-muted)]">
                        <p>
                          Raportuar më:{' '}
                          {damage.reportedAt || 'E papërcaktuar'}
                        </p>

                        {resolved && (
                          <p>
                            Zgjidhur më:{' '}
                            {damage.resolvedAt || 'E papërcaktuar'}
                          </p>
                        )}

                        {damage.needsReplacement && (
                          <p className="mt-3 flex items-start gap-2 text-amber-700">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>
                              Kërkohet zëvendësim
                              {damage.replacementNote
                                ? `: ${damage.replacementNote}`
                                : ''}
                            </span>
                          </p>
                        )}
                      </div>

                      {updatingIds.includes(damage.id) && (
                        <p className="mt-3 text-xs text-[var(--text-muted)]">
                          Duke ruajtur ndryshimin…
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <Link
          to={`/dresses/${id}/damages/new`}
          className="mt-6 inline-flex border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-3 text-xs uppercase tracking-wider text-white hover:bg-[var(--pink-dark)]"
        >
          Raporto dëmtim të ri
        </Link>
      </div>
    </main>
  )
}

export default DressDamages
