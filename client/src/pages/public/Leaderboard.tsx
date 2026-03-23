import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function Leaderboard() {
 useWebSocket() // Listen for global rankings updates
 const { data, isLoading } = useQuery({
 queryKey: ['global-leaderboard'],
 queryFn: () => api.get('/leaderboard/global').then((r) => r.data.data).catch(() => []),
 })

 const rankings: any[] = data || []

 const rankMedal = (rank: number) => {
 if (rank === 1) return ''
 if (rank === 2) return ''
 if (rank === 3) return ''
 return `#${rank}`
 }

 return (
 <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
 <div className="mb-8">
 <h1 className="font-display text-4xl font-bold text-[hsl(var(--foreground))]">Leaderboard</h1>
 <p className="text-[hsl(var(--muted-foreground))] mt-1">All-time rankings across the platform.</p>
 </div>

 {/* Podium top 3 */}
 {rankings.length >= 3 && (
 <div className="flex items-end justify-center gap-4 mb-10">
 {[1, 0, 2].map((i) => {
 const r = rankings[i]
 if (!r) return null
 const heights = ['h-24', 'h-32', 'h-20']
 const colors = ['text-[hsl(var(--rank-silver))]', 'text-[hsl(var(--rank-gold))]', 'text-[hsl(var(--rank-bronze))]']
 const bgColors = ['bg-[hsl(var(--rank-silver)/0.1)]', 'bg-[hsl(var(--rank-gold)/0.1)]', 'bg-[hsl(var(--rank-bronze)/0.1)]']
 return (
 <div key={r.userId || i} className={`flex-1 max-w-[160px] ${bgColors[i]} border border-[hsl(var(--border))] rounded-xl ${heights[i]} flex flex-col items-center justify-end pb-4 px-3`}>
 <div className={`text-2xl font-bold ${colors[i]}`}>{rankMedal(r.rank || i + 1)}</div>
 <p className="font-medium text-[hsl(var(--foreground))] text-sm mt-1 truncate w-full text-center">{r.username}</p>
 <p className="text-xs text-[hsl(var(--muted-foreground))]">{r.totalScore || r.rating} pts</p>
 </div>
 )
 })}
 </div>
 )}

 {/* Rankings table */}
 <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
 {isLoading ? (
 <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading rankings...</div>
 ) : rankings.length === 0 ? (
 <div className="p-12 text-center text-[hsl(var(--muted-foreground))]">
 <p className="text-4xl mb-3"></p>
 <p className="font-display text-lg font-semibold">No rankings yet</p>
 <p className="text-sm mt-1">Complete contests to appear on the leaderboard.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="border-b border-[hsl(var(--border)/0.5)]">
 <tr>
 {['Rank', 'Coder', 'Rating', 'Solved', 'Contests'].map((h) => (
 <th key={h} className="text-left py-3.5 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {rankings.map((r: any, idx: number) => (
 <tr key={r._id || idx} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.15)] transition-colors">
 <td className="py-3.5 px-4">
 <span className={`font-bold font-mono ${idx === 0 ? 'text-[hsl(var(--rank-gold))]' : idx === 1 ? 'text-[hsl(var(--rank-silver))]' : idx === 2 ? 'text-[hsl(var(--rank-bronze))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
 {rankMedal(idx + 1)}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))] text-xs font-bold">{r.username?.[0]?.toUpperCase()}</div>
 <span className="font-medium text-[hsl(var(--foreground))]">{r.username}</span>
 </div>
 </td>
 <td className="py-3.5 px-4 text-[hsl(var(--primary))] font-semibold">{r.rating}</td>
 <td className="py-3.5 px-4 text-[hsl(var(--foreground))]">{r.stats?.solved ?? 0}</td>
 <td className="py-3.5 px-4 text-[hsl(var(--foreground))]">{r.stats?.contests ?? 0}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 )
}
