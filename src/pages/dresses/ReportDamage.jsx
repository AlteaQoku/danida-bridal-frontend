import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardPlus,
  AlertCircle,
  LoaderCircle,
  Save,
  Shirt,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react'
import api from '../../api/axiosConfig'

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function ReportDamage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dress, setDress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    description: '',
    reportedAt: getToday(),
    needsReplacement: false,
    replacementNote: '',
  })

  // Load the dress associated with this damage report.
  useEffect(() => {
    let active = true

    async function fetchDress() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/api/dresses/${id}`)

        if (active) {
          setDress(response.data)
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              'Detajet e fustanit nuk u ngarkuan.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDress()

    return () => {
      active = false
    }
  }, [id])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.description.trim()) {
      setError('Ju lutem përshkruani dëmtimin.')
      return
    }

    if (!formData.reportedAt) {
      setError('Ju lutem zgjidhni datën e raportimit.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        description: formData.description.trim(),
        reportedAt: formData.reportedAt,
        needsReplacement: formData.needsReplacement,
        replacementNote: formData.needsReplacement
          ? formData.replacementNote.trim() || null
          : null,
      }

      await api.post(`/api/dresses/${id}/damages`, payload)

      setSuccess(true)

      // Return to the dress details page after successful submission.
      navigate(`/dresses/${id}`)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Raporti i dëmtimit nuk u dërgua. Ju lutem provoni përsëri.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <LoaderCircle size={20} className="animate-spin" />
        <span>Duke ngarkuar detajet e fustanit...</span>
      </div>
    )
  }

  if (!dress) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8">
          <div className="mb-4 flex items-start gap-3 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error || 'Fustani nuk u gjet.'}</p>
          </div>

          <Link
            to="/dresses"
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground)] hover:opacity-70"
          >
            <ArrowLeft size={16} />
            Kthehu te fustanet
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--pink-light)] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Back navigation */}
        <Link
          to={`/dresses/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Kthehu te detajet e fustanit
        </Link>

        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            DANIDA BRIDAL · KOLEKSIONI
          </p>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
              <ClipboardPlus
                size={25}
                strokeWidth={1.5}
                className="text-[var(--foreground)]"
              />
            </div>

            <div>
              <h1 className="font-serif text-3xl font-normal text-[var(--foreground)] sm:text-4xl">
                Raporto dëmtim
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Regjistroni një incident të ri për këtë fustan.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected dress */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--pink-light)]">
                <Shirt size={25} strokeWidth={1.4} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Fustani i zgjedhur
                </p>

                <h2 className="truncate font-serif text-xl text-[var(--foreground)]">
                  {dress.name}
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  ID: {dress.id}
                  {dress.size ? ` · Madhësia ${dress.size}` : ''}
                  {dress.color ? ` · ${dress.color}` : ''}
                </p>
              </div>
            </div>
          </section>

          {/* Damage details */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Detajet e dëmtimit
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Përshkruani problemin qartë që të mund të ndiqet.
              </p>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Përshkrimi i dëmtimit *
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder="Përshkruani çfarë është dëmtuar dhe ku ndodhet..."
                  className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--pink-dark)]"
                />

                <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                  {formData.description.length}/5000
                </p>
              </div>

              {/* Report date */}
              <div>
                <label
                  htmlFor="reportedAt"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Data e raportimit *
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />

                  <input
                    id="reportedAt"
                    name="reportedAt"
                    type="date"
                    value={formData.reportedAt}
                    onChange={handleChange}
                    max={getToday()}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--pink-dark)]"
                  />
                </div>
              </div>

              {/* Replacement requirement */}
              <div className="rounded-xl border border-[var(--border)] p-4 sm:p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="needsReplacement"
                    checked={formData.needsReplacement}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-[var(--pink-dark)]"
                  />

                  <span>
                    <span className="block text-sm font-medium text-[var(--foreground)]">
                      Kërkohet zëvendësimi
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[var(--text-muted)]">
                      Zgjidhni këto nëse artikulli ose pjesa e dëmtuar duhet
                      të zëvendësohet.
                    </span>
                  </span>
                </label>

                {formData.needsReplacement && (
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <label
                      htmlFor="replacementNote"
                      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                    >
                      Shënim për zëvendësimin
                    </label>

                    <textarea
                      id="replacementNote"
                      name="replacementNote"
                      value={formData.replacementNote}
                      onChange={handleChange}
                      rows={3}
                      maxLength={3000}
                      placeholder="Çfarë duhet zëvendësuar dhe pse? Shtoni detaje të dobishme..."
                      className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--pink-dark)]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success feedback for any future non-navigating flow */}
            {success && (
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 size={17} />
                Raporti i dëmtimit u dërgua me sukses.
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Link
                to={`/dresses/${id}`}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
              >
                Anulo
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? 'Duke dërguar raportin...' : 'Dërgo raportin e dëmtimit'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  )
}
