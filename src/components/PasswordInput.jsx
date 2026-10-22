import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({ id, value, onChange, autoComplete = 'new-password', maxLength = 128 }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        maxLength={maxLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-4 pr-11 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput