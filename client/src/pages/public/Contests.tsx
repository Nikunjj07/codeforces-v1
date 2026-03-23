import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

function StatusBadge({ status }: { status: string }) {
 const map: Record<string, string> = {
 LIVE: 'bg-[hsl(var(--status-accepted)/0.15)] text-[hsl(var(--status-accepted))] border-[hsl(var(--status-accepted)/0.3)]',
 PUBLISHED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]',
 ENDED: 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
 DRAFT: 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
 }
 const label = status === 'PUBLISHED' ? 'UPCOMING' : status
 return (
 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.ENDED}`}>
 {status === 'LIVE' && '● '}{label}
 </span>
 )
}

function ContestCard({ c }: { c: any }) {
 return (
 <Link
 to={`/contests/${c._id}`}
 className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 hover:border-[hsl(var(--primary)/0.4)] hover:glow-cyan transition-all duration-200 group flex flex-col gap-3"
 >
 <div className="flex items-center justify-between">
 <StatusBadge status={c.status} />
 <span className={`text-xs font-medium diff-${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span>
 </div>
 <div>
 <h3 className="font-display text-lg font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{c.title}</h3>
 <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1 line-clamp-2">{c.description}</p>
 </div>
 <div className="flex flex-wrap gap-1.5 mt-auto">
 {c.tags?.slice(0, 3).map((t: string) => (
 <span key={t} className="px-2 py-0.5 bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] text-xs rounded-md">{t}</span>
 ))}
 </div>
 <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] pt-1 border-t border-[hsl(var(--border)/0.5)]">
 <span> {c.participants?.length || 0} joined</span>
 <span>⏱ {c.duration}min</span>
 <span className="font-medium">{c.scoringType}</span>
 </div>
 </Link>
 )
}

const FILTER_STATUSES = ['All', 'LIVE', 'PUBLISHED', 'ENDED']
const DIFFICULTIES = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export default function Contests() {
 const [search, setSearch] = useState('')
 const [status, setStatus] = useState('All')
 const [difficulty, setDifficulty] = useState('All')
 const [page, setPage] = useState(1)

 const { data, isLoading } = useQuery({
 queryKey: ['contests', search, status, difficulty, page],
 queryFn: () =>
 api.get('/contests', {
 params: {
 search: search || undefined,
 status: status === 'All' ? undefined : status,
 difficulty: difficulty === 'All' ? undefined : difficulty,
 page,
 limit: 12,
 },
 }).then((r) => r.data.data),
 placeholderData: (prev) => prev,
 })

 const contests: any[] = data?.data || []

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
 <div className="mb-8">
 <h1 className="font-display text-4xl font-bold text-[hsl(var(--foreground))]">Contests</h1>
 <p className="text-[hsl(var(--muted-foreground))] mt-1">Browse, register, and compete.</p>
 </div>

 {/* Search + filters */}
 <div className="flex flex-col md:flex-row gap-4 mb-8">
 <div className="relative flex-1">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="text"
 placeholder="Search contests..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1) }}
 className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-1 focus:ring-[hsl(var(--ring)/0.3)] transition-all"
 />
 </div>

 <div className="flex flex-wrap gap-2">
 {FILTER_STATUSES.map((s) => (
 <button
 key={s}
 onClick={() => { setStatus(s); setPage(1) }}
 className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
 status === s
 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
 : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
 }`}
 >
 {s === 'PUBLISHED' ? 'Upcoming' : s}
 </button>
 ))}
 </div>

 <select
 value={difficulty}
 onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
 className="px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] cursor-pointer"
 >
 {DIFFICULTIES.map((d) => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
 </select>
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 animate-pulse h-52" />
 ))}
 </div>
 ) : contests.length === 0 ? (
 <div className="text-center py-24 text-[hsl(var(--muted-foreground))]">
 <p className="text-5xl mb-4"></p>
 <p className="font-display text-xl font-semibold">No contests found</p>
 <p className="text-sm mt-2">Try adjusting your filters</p>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {contests.map((c: any) => <ContestCard key={c._id} c={c} />)}
 </div>
 )}

 {/* Pagination */}
 {data && data.totalPages > 1 && (
 <div className="flex items-center justify-center gap-3 mt-10">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={!data.hasPrev}
 className="px-4 py-2 rounded-lg bg-[hsl(var(--muted)/0.5)] text-sm disabled:opacity-40 hover:bg-[hsl(var(--muted))] transition-colors"
 >
 ← Prev
 </button>
 <span className="text-[hsl(var(--muted-foreground))] text-sm">Page {data.page} of {data.totalPages}</span>
 <button
 onClick={() => setPage((p) => p + 1)}
 disabled={!data.hasNext}
 className="px-4 py-2 rounded-lg bg-[hsl(var(--muted)/0.5)] text-sm disabled:opacity-40 hover:bg-[hsl(var(--muted))] transition-colors"
 >
 Next →
 </button>
 </div>
 )}
 </div>
 )
}
