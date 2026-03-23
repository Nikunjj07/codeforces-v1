import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data.data).catch(() => ({})),
  })

  const stats = data || {}

  const kpis = [
    { label: 'Total Users',       value: stats.totalUsers ?? '—',       icon: '👥', color: 'hsl(var(--primary))' },
    { label: 'Active Contests',   value: stats.activeContests ?? '—',   icon: '🏆', color: 'hsl(var(--status-accepted))' },
    { label: 'Submissions Today', value: stats.submissionsToday ?? '—', icon: '📬', color: 'hsl(var(--secondary))' },
    { label: 'Total Contests',    value: stats.totalContests ?? '—',    icon: '📊', color: 'hsl(var(--status-tle))' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Admin Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">{label}</p>
              <span className="text-2xl">{icon}</span>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link to="/admin/contests/new" className="px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-all glow-cyan">+ New Contest</Link>
        <Link to="/admin/problems" className="px-5 py-2.5 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] text-sm font-semibold hover:opacity-90 transition-all">+ New Problem</Link>
      </div>
    </div>
  )
}
