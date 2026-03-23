import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard',   path: '/admin',              icon: '⊞' },
  { label: 'Contests',    path: '/admin/contests',     icon: '🏆' },
  { label: 'Problems',    path: '/admin/problems',     icon: '📝' },
  { label: 'Users',       path: '/admin/users',        icon: '👥' },
  { label: 'Submissions', path: '/admin/submissions',  icon: '📊' },
]

export default function AdminLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="w-60 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col hidden md:flex">
        {/* Brand */}
        <Link to="/admin" className="flex items-center gap-2 px-5 py-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-7 h-7 rounded-md bg-[hsl(var(--sidebar-primary))] flex items-center justify-center">
            <span className="text-[hsl(var(--sidebar-primary-foreground))] font-mono font-bold text-xs">CA</span>
          </div>
          <span className="font-display font-bold text-[hsl(var(--sidebar-foreground))] text-base">Admin</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))]'
                    : 'text-[hsl(var(--sidebar-foreground)/0.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-primary))] font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-[hsl(var(--sidebar-foreground))] font-medium text-sm">{user?.username}</p>
              <p className="text-[hsl(var(--sidebar-foreground)/0.5)] text-xs">{user?.role}</p>
            </div>
          </div>
          <Link to="/" className="mt-3 block text-xs text-[hsl(var(--sidebar-foreground)/0.5)] hover:text-[hsl(var(--sidebar-foreground))] transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center px-6 md:hidden">
          <Link to="/admin" className="font-display font-bold text-[hsl(var(--foreground))]">CodeArena Admin</Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
