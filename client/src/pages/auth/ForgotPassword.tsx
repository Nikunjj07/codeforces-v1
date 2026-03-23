import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await api.post('/auth/forgot-password', { email }) } catch {}
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4 bg-[hsl(var(--background))]">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-[hsl(var(--primary-foreground))] font-mono font-bold">CA</span>
            </div>
            <span className="font-display font-bold text-xl text-[hsl(var(--foreground))]">Code<span className="text-gradient-cyan">Arena</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Reset Password</h1>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-[hsl(var(--foreground))] font-semibold mb-2">Check your inbox</p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">If that email is registered, you'll receive a reset link shortly.</p>
              <Link to="/login" className="block mt-6 text-[hsl(var(--primary))] text-sm hover:underline">← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">Enter your email and we'll send you a reset link.</p>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] transition-all" />
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold disabled:opacity-50 hover:opacity-90 transition-all">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="block text-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">← Back to sign in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
