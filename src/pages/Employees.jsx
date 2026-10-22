import { useCallback, useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import PasswordInput from '../components/PasswordInput'

const inputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]'
const labelClass = 'mb-1 block text-sm text-[var(--text-muted)]'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Create form
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creating, setCreating] = useState(false)

  // Reset password (one row open at a time)
  const [resetId, setResetId] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetting, setResetting] = useState(false)

  const loadEmployees = useCallback(async () => {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (password.length < 12) {
      setCreateError('Fjalëkalimi duhet të ketë të paktën 12 karaktere.')
      return
    }

    setCreating(true)
    try {
      await api.post('/employees', {
        username: username.trim(),
        fullName: fullName.trim(),
        password,
      })
      setCreateSuccess(`Punonjësi "${username.trim().toLowerCase()}" u krijua.`)
      setUsername('')
      setFullName('')
      setPassword('')
      loadEmployees()
    } catch (err) {
      if (err.response?.status === 409) {
        setCreateError('Ky emër përdoruesi ekziston tashmë.')
      } else if (err.response?.status === 400) {
        setCreateError(
          'Të dhënat nuk janë të vlefshme. Emri i përdoruesit: 3-100 karaktere, vetëm shkronja, shifra, pikë, viza.'
        )
      } else {
        setCreateError('Punonjësi nuk u krijua. Provoni përsëri.')
      }
    } finally {
      setCreating(false)
    }
  }

  const openReset = (id) => {
    setResetId(id)
    setResetPassword('')
    setResetError('')
    setResetSuccess('')
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetError('')

    if (resetPassword.length < 12) {
      setResetError('Fjalëkalimi duhet të ketë të paktën 12 karaktere.')
      return
    }

    setResetting(true)
    try {
      await api.put(`/employees/${resetId}/password`, {
        newPassword: resetPassword,
      })
      setResetSuccess('Fjalëkalimi u rivendos.')
      setResetPassword('')
    } catch {
      setResetError('Fjalëkalimi nuk u rivendos. Provoni përsëri.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-[var(--foreground)]">
          Punonjësit
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Shto punonjës të rinj dhe rivendos fjalëkalimet.
        </p>
      </div>

      {/* Create form */}
      <section className="max-w-xl rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
        <h2 className="mb-4 font-serif text-xl text-[var(--foreground)]">
          Shto punonjës
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="emp-username" className={labelClass}>
              Emri i përdoruesit
            </label>
            <input
              id="emp-username"
              type="text"
              required
              minLength={3}
              maxLength={100}
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="emp-fullname" className={labelClass}>
              Emri i plotë
            </label>
            <input
              id="emp-fullname"
              type="text"
              required
              maxLength={255}
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="emp-password" className={labelClass}>
              Fjalëkalimi fillestar (të paktën 12 karaktere)
            </label>
            <PasswordInput
              id="emp-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {createError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createError}
            </p>
          )}
          {createSuccess && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {createSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-[var(--pink-dark)] px-5 py-2.5 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {creating ? 'Duke krijuar...' : 'Krijo punonjësin'}
          </button>
        </form>
      </section>

      {/* List */}
      <section>
        <h2 className="mb-4 font-serif text-xl text-[var(--foreground)]">
          Lista e punonjësve
        </h2>

        {loading && (
          <p className="text-sm text-[var(--text-muted)]">Duke ngarkuar...</p>
        )}
        {loadError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Lista nuk mund të ngarkohej.
          </p>
        )}

        {!loading && !loadError && (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--pink-light)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-normal">Përdoruesi</th>
                  <th className="px-4 py-3 font-normal">Emri i plotë</th>
                  <th className="px-4 py-3 font-normal">Roli</th>
                  <th className="px-4 py-3 font-normal">Statusi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <FragmentRow key={emp.id}>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {emp.username}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {emp.fullName}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {emp.admin ? 'Administrator' : 'Punonjës'}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {emp.enabled ? 'Aktiv' : 'Joaktiv'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            resetId === emp.id ? setResetId(null) : openReset(emp.id)
                          }
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
                        >
                          Rivendos fjalëkalimin
                        </button>
                      </td>
                    </tr>

                    {resetId === emp.id && (
                      <tr className="border-t border-[var(--border)] bg-[var(--pink-light)]/40">
                        <td colSpan={5} className="px-4 py-4">
                          <form
                            onSubmit={handleReset}
                            className="flex flex-wrap items-end gap-3"
                          >
                            <div className="min-w-64 flex-1">
                              <label
                                htmlFor={`reset-${emp.id}`}
                                className={labelClass}
                              >
                                Fjalëkalimi i ri për {emp.username}
                              </label>
                              <PasswordInput
                                id={`reset-${emp.id}`}
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={resetting}
                              className="rounded-lg bg-[var(--pink-dark)] px-4 py-2.5 text-white transition hover:opacity-90 disabled:opacity-60"
                            >
                              {resetting ? 'Duke ruajtur...' : 'Ruaj'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setResetId(null)}
                              className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--foreground)] transition hover:bg-[var(--background)]"
                            >
                              Mbyll
                            </button>
                          </form>

                          {resetError && (
                            <p className="mt-3 text-sm text-red-700">{resetError}</p>
                          )}
                          {resetSuccess && (
                            <p className="mt-3 text-sm text-green-700">
                              {resetSuccess}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// Lets one employee render two table rows without a wrapper element
function FragmentRow({ children }) {
  return <>{children}</>
}

export default Employees