import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
    if (err.response?.status === 401) {
      setError('Emri i përdoruesit ose fjalëkalimi është i pasaktë.')
    } else if (err.response?.status === 429) {
      setError('Shumë përpjekje të pasuksesshme. Provoni përsëri pas 15 minutash.')
    } else {
      setError('Nuk u arrit lidhja me serverin. Provoni përsëri.')
    }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pink-light)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm sm:p-10">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Mirë se vini në
        </p>

        <h1 className="text-center font-serif text-3xl font-normal uppercase tracking-wide text-[var(--foreground)]">
          Danida Bridal
        </h1>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-sm text-[var(--pink-dark)]">◆</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm text-[var(--text-muted)]"
            >
              Emri i përdoruesit
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              maxLength={100}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
            />
          </div>

         <div>
             <label
               htmlFor="password"
               className="mb-1 block text-sm text-[var(--text-muted)]"
             >
               Fjalëkalimi
             </label>
             <div className="relative">
               <input
                 id="password"
                 type={showPassword ? 'text' : 'password'}
                 autoComplete="current-password"
                 required
                 maxLength={128}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-4 pr-11 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword((v) => !v)}
                 aria-label={showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
             </div>
        </div>
            
                     {error && (
                       <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--pink-dark)] px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Duke hyrë...' : 'Hyr'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login