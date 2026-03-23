import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STUDENT', institution: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('accessToken', data.data.accessToken)
      setUser(data.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-1 focus:ring-[hsl(var(--ring)/0.3)] transition-all"

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-10 bg-[hsl(var(--background))]">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-[hsl(var(--primary-foreground))] font-mono font-bold">CA</span>
            </div>
            <span className="font-display font-bold text-xl text-[hsl(var(--foreground))]">Code<span className="text-gradient-cyan">Arena</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Join CodeArena</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">Create your account and start competing</p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] text-sm">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Username</label>
                <input type="text" required value={form.username} onChange={set('username')} placeholder="coder_42" className={inputClass} pattern="[a-zA-Z0-9_]+" title="Only letters, numbers, underscores" minLength={3} maxLength={20} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Role</label>
                <select value={form.role} onChange={set('role')} className={inputClass}>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="you@university.edu" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 characters" className={inputClass} minLength={8} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">University / School <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span></label>
              <input type="text" value={form.institution} onChange={set('institution')} placeholder="IIT Bombay" className={inputClass} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90 disabled:opacity-50 transition-all glow-cyan mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
