import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-[hsl(var(--primary))]'
        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-glass-heavy border-b border-[hsl(var(--border)/0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <span className="text-[hsl(var(--primary-foreground))] font-mono font-bold text-sm">CA</span>
          </div>
          <span className="font-display font-bold text-[hsl(var(--foreground))] text-lg tracking-tight">
            Code<span className="text-gradient-cyan">Arena</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/contests" className={navLinkClass}>Contests</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          )}
          {user && ['ADMIN', 'TEACHER'].includes(user.role) && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))] font-semibold text-sm group-hover:ring-2 ring-[hsl(var(--primary)/0.5)] transition-all">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-[hsl(var(--foreground))] font-medium">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-all glow-cyan"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[hsl(var(--muted-foreground))]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-glass-heavy border-t border-[hsl(var(--border)/0.3)] px-4 py-4 flex flex-col gap-4 animate-slide-up">
          <NavLink to="/contests" className={navLinkClass} onClick={() => setMenuOpen(false)}>Contests</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Leaderboard</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {!isAuthenticated && (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="flex-1 text-center py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
