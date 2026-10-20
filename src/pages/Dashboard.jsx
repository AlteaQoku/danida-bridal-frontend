
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Shirt,
  ArrowRight,
} from 'lucide-react'
import api from '../api/axiosConfig'

function Dashboard() {
  const [dresses, setDresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    const fetchDresses = async () => {
      try {
        const response = await api.get('/dresses')
        const data = response.data

        const dressList = Array.isArray(data)
          ? data
          : data?.content ?? data?.dresses ?? []

        if (active) {
          setDresses(dressList)
          setError(false)
        }
      } catch (err) {
        console.error('Failed to load dresses:', {
          message: err.message,
          url: err.config?.url,
          status: err.response?.status,
          response: err.response?.data,
        })

        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDresses()

    return () => {
      active = false
    }
  }, [])

  // Match the fields returned by the dresses API.
  const dressesWithBride = dresses.filter(
    (dress) => dress.location === 'WITH_BRIDE'
  )

  const damagedDresses = dresses.filter(
    (dress) => dress.hasUnresolvedDamage === true
  )

  const stats = [
    {
      label: 'Fustanet me nuse',
      value: dressesWithBride.length,
      description: 'Fustane që aktualisht ndodhen te nuset',
      icon: Shirt,
      href: '/dresses',
      loading,
      failed: error,
    },
    {
      label: 'Fustanet me dëmtime',
      value: damagedDresses.length,
      description: 'Fustane me dëmtime të pazgjidhura',
      icon: AlertTriangle,
      href: '/dresses/damaged',
      loading,
      failed: error,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section
        className="relative overflow-hidden rounded-xl
          border border-[var(--border)] bg-[var(--pink-light)]
          px-6 py-10 sm:px-10 sm:py-12"
      >
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Mirë se vini në
          </p>

          <h1
            className="font-serif text-4xl font-normal uppercase
              tracking-wide text-[var(--foreground)] sm:text-5xl lg:text-6xl"
          >
            Danida Bridal
          </h1>

          <div className="my-5 flex max-w-sm items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-sm text-[var(--pink-dark)]">◆</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <p className="font-serif text-base italic leading-relaxed text-[var(--text-muted)] sm:text-lg">
            Elegancë, cilësi dhe detaje që tregojnë historinë tuaj.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[var(--foreground)]">
              Përmbledhje
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Gjendja aktuale e butikut tuaj
            </p>
          </div>

          <span className="text-xs text-[var(--text-muted)]">
            {loading ? 'Duke ngarkuar...' : 'Të dhëna aktuale'}
          </span>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Statistikat nuk mund të ngarkoheshin. Kontrolloni lidhjen me serverin.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Link
                key={stat.label}
                to={stat.href}
                className="group rounded-xl border border-[var(--border)]
                  bg-[var(--background)] p-5 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--pink-light)] text-[var(--pink-dark)]">
                    <Icon size={21} strokeWidth={1.6} />
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="mt-5 text-sm text-[var(--text-muted)]">
                  {stat.label}
                </p>

                <p className="mt-1 font-serif text-3xl text-[var(--foreground)]">
                  {stat.loading ? '—' : stat.failed ? '!' : stat.value}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  {stat.failed ? 'Të dhënat nuk janë të disponueshme' : stat.description}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 font-serif text-xl text-[var(--foreground)]">
          Veprime të shpejta
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/dresses/create"
            className="group flex min-h-32 items-center justify-between gap-4 rounded-xl bg-[var(--pink-dark)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-8"
          >
            <div>
              <h3 className="font-serif text-xl text-white">
                Shto fustan
              </h3>
              <p className="mt-1 text-sm text-white/80">
                Regjistro një fustan të ri
              </p>
            </div>

            <span className="text-xl text-white transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            to="/dresses/damaged"
            className="group flex items-center gap-4 rounded-xl border border-red-200 bg-[var(--background)] p-5 transition hover:border-red-300 hover:bg-red-50 sm:col-span-2"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-xl text-[var(--foreground)]">
                Fustanet me dëmtime
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Shiko fustanet e dëmtuara dhe historikun e tyre.
              </p>
            </div>

            <ArrowRight size={18} className="text-[var(--text-muted)]" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
