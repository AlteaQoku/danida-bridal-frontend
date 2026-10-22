import { useState } from 'react'
import api from '../api/axiosConfig'
import PasswordInput from '../components/PasswordInput'
function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 12) {
      setError('Fjalëkalimi i ri duhet të ketë të paktën 12 karaktere.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet e reja nuk përputhen.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setSuccess('Fjalëkalimi u ndryshua me sukses.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err.response?.data?.error
      if (message === 'Current password is incorrect') {
        setError('Fjalëkalimi aktual është i pasaktë.')
      } else if (message === 'New password must be different') {
        setError('Fjalëkalimi i ri duhet të jetë i ndryshëm nga ai aktual.')
      } else {
        setError('Fjalëkalimi nuk u ndryshua. Provoni përsëri.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]'
  const labelClass = 'mb-1 block text-sm text-[var(--text-muted)]'

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[var(--foreground)]">
          Ndrysho fjalëkalimin
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Fjalëkalimi i ri duhet të ketë të paktën 12 karaktere.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-6"
      >
        <div>
          <label htmlFor="current" className={labelClass}>
            Fjalëkalimi aktual
          </label>
          <PasswordInput
            id="current"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="new" className={labelClass}>
            Fjalëkalimi i ri
          </label>
          <PasswordInput
            id="new"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirm" className={labelClass}>
            Përsërit fjalëkalimin e ri
          </label>
          <PasswordInput
            id="confirm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--pink-dark)] px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Duke ruajtur...' : 'Ruaj fjalëkalimin'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword