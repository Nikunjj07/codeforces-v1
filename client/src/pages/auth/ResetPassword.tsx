import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError(''); setLoading(true)
    try {
      await api.post('/auth/reset-password', { email: params.get('email'), token: params.get('token'), password })
      navigate('/login?reset=success')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  const inputClass = "w-full px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] transition-all"

  return (
    <div className="min-h-svh flex items-center justify-center px-4 bg-[hsl(var(--background))]">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">New Password</h1>
        </div>
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">New Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Confirm Password</label>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold disabled:opacity-50 hover:opacity-90 transition-all">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <Link to="/login" className="block text-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">← Back to sign in</Link>
          </form>
        </div>
      </div>
    </div>
  )
}
