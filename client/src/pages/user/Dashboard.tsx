import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
 return (
 <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-[hsl(var(--muted-foreground))] text-sm">{label}</p>
 <span className="text-2xl">{icon}</span>
 </div>
 <p className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{value}</p>
 </div>
 )
}

const STATUS_COLORS: Record<string, string> = {
 ACCEPTED: 'status-accepted',
 WRONG_ANSWER: 'status-wrong',
 TIME_LIMIT_EXCEEDED: 'status-tle',
 PENDING: 'status-pending',
 COMPILATION_ERROR: 'status-ce',
 RUNTIME_ERROR: 'status-re',
}

export default function Dashboard() {
 const { user } = useAuth()

 const { data: submissionsData } = useQuery({
 queryKey: ['my-submissions'],
 queryFn: () => api.get('/contests/placeholder/my-submissions').then((r) => r.data.data.submissions).catch(() => []),
 })

 const subs: any[] = submissionsData || []

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
 {/* Header */}
 <div className="mb-8 flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] font-display text-2xl font-bold">
 {user?.username?.[0]?.toUpperCase()}
 </div>
 <div>
 <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
 Hey, {user?.username} 
 </h1>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[hsl(var(--muted-foreground))] text-sm">{user?.role}</span>
 <span className="text-[hsl(var(--muted-foreground))]">·</span>
 <span className="text-[hsl(var(--primary))] text-sm font-semibold"> {user?.rating} rating</span>
 </div>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
 <StatCard label="Contests Entered" value={user?.stats.contests || 0} icon="" />
 <StatCard label="Problems Solved" value={user?.stats.solved || 0} icon="" />
 <StatCard label="Best Rank" value="—" icon="" />
 <StatCard label="Current Streak" value={`${user?.stats.streak || 0}d`} icon="" />
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Recent submissions */}
 <div className="lg:col-span-2">
 <h2 className="font-display text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Recent Submissions</h2>
 <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
 {subs.length === 0 ? (
 <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
 <p className="text-3xl mb-2"></p>
 <p className="text-sm">No submissions yet. <Link to="/contests" className="text-[hsl(var(--primary))] hover:underline">Find a contest</Link>.</p>
 </div>
 ) : (
 <table className="w-full text-sm">
 <thead className="border-b border-[hsl(var(--border)/0.5)]">
 <tr>
 {['Problem', 'Status', 'Language', 'Time'].map((h) => (
 <th key={h} className="text-left py-3 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {subs.slice(0, 10).map((s: any) => (
 <tr key={s._id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.1)] transition-colors">
 <td className="py-3 px-4 font-medium text-[hsl(var(--foreground))]">{s.problemId?.title || '—'}</td>
 <td className={`py-3 px-4 font-semibold font-mono text-xs ${STATUS_COLORS[s.status] || 'status-pending'}`}>{s.status}</td>
 <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{s.language}</td>
 <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{new Date(s.submittedAt).toLocaleDateString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {/* Quick actions */}
 <div className="space-y-4">
 <h2 className="font-display text-xl font-semibold text-[hsl(var(--foreground))]">Quick Actions</h2>
 <Link to="/contests" className="flex items-center gap-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-[hsl(var(--primary)/0.4)] hover:glow-cyan transition-all group">
 <span className="text-2xl"></span>
 <div>
 <p className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">Browse Contests</p>
 <p className="text-[hsl(var(--muted-foreground))] text-xs">Find your next challenge</p>
 </div>
 </Link>
 <Link to="/leaderboard" className="flex items-center gap-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-[hsl(var(--primary)/0.4)] transition-all group">
 <span className="text-2xl"></span>
 <div>
 <p className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">Global Leaderboard</p>
 <p className="text-[hsl(var(--muted-foreground))] text-xs">See where you rank</p>
 </div>
 </Link>
 <Link to={`/profile/${user?.username}`} className="flex items-center gap-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-[hsl(var(--primary)/0.4)] transition-all group">
 <span className="text-2xl"></span>
 <div>
 <p className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">My Profile</p>
 <p className="text-[hsl(var(--muted-foreground))] text-xs">View public profile</p>
 </div>
 </Link>
 </div>
 </div>
 </div>
 )
}
