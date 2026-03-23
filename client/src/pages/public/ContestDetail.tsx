import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(0)
  useEffect(() => {
    const update = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [target])
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return <span className="font-mono tabular-nums text-[hsl(var(--primary))]">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
}

export default function ContestDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'overview' | 'problems' | 'leaderboard' | 'submissions'>('overview')

  const { data, isLoading } = useQuery({
    queryKey: ['contest', id],
    queryFn: () => api.get(`/contests/${id}`).then((r) => r.data.data.contest),
  })

  const { data: problems } = useQuery({
    queryKey: ['contest-problems', id],
    queryFn: () => api.get(`/contests/${id}/problems`).then((r) => r.data.data.problems),
    enabled: tab === 'problems' && isAuthenticated,
    retry: false,
  })

  const { data: leaderboardData } = useQuery({
    queryKey: ['contest-leaderboard', id],
    queryFn: () => api.get(`/contests/${id}/leaderboard`).then((r) => r.data.data.leaderboard),
    enabled: tab === 'leaderboard',
    refetchInterval: tab === 'leaderboard' ? 30_000 : false,
  })

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/contests/${id}/register`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contest', id] }),
  })

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-[hsl(var(--muted))] rounded w-1/3 mb-4" />
      <div className="h-4 bg-[hsl(var(--muted))] rounded w-2/3" />
    </div>
  )

  const c = data
  if (!c) return <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">Contest not found</div>

  const isParticipant = user && c.participants?.includes(user._id)
  const isAdmin = user && ['ADMIN', 'TEACHER'].includes(user.role)
  const now = Date.now()
  const isLive = c.status === 'LIVE' && now >= new Date(c.startTime).getTime() && now <= new Date(c.endTime).getTime()
  const countdownTarget = isLive ? c.endTime : c.startTime

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'problems', label: 'Problems' },
    { id: 'leaderboard', label: 'Leaderboard' },
    ...(isAuthenticated ? [{ id: 'submissions', label: 'My Submissions' }] : []),
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                c.status === 'LIVE' ? 'bg-[hsl(var(--status-accepted)/0.15)] text-[hsl(var(--status-accepted))] border-[hsl(var(--status-accepted)/0.3)]' :
                c.status === 'PUBLISHED' ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]' :
                'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]'
              }`}>{c.status}</span>
              <span className={`text-sm font-medium diff-${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{c.scoringType}-style scoring</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))]">{c.title}</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">by {c.createdBy?.username}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[hsl(var(--border)/0.5)] mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  tab === t.id
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'overview' && (
            <div className="prose-like space-y-4">
              <p className="text-[hsl(var(--foreground))] leading-relaxed">{c.description}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {[
                  ['Start', new Date(c.startTime).toLocaleString()],
                  ['End', new Date(c.endTime).toLocaleString()],
                  ['Duration', `${c.duration} minutes`],
                  ['Participants', c.participants?.length || 0],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-lg p-4">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
                    <p className="text-[hsl(var(--foreground))] font-medium">{val as string}</p>
                  </div>
                ))}
              </div>
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {c.tags.map((t: string) => (
                    <span key={t} className="px-2.5 py-1 bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] text-xs rounded-lg">{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'problems' && (
            <div>
              {!isAuthenticated ? (
                <p className="text-[hsl(var(--muted-foreground))]">Please <Link to="/login" className="text-[hsl(var(--primary))] hover:underline">sign in</Link> to view problems.</p>
              ) : !isParticipant && !isAdmin ? (
                <p className="text-[hsl(var(--muted-foreground))]">You must be registered for this contest to view problems.</p>
              ) : !problems ? (
                <p className="text-[hsl(var(--muted-foreground))]">Loading problems...</p>
              ) : (
                <div className="space-y-2">
                  {problems.map((p: any, i: number) => (
                    <Link
                      key={p._id}
                      to={`/contests/${id}/problems/${p._id}`}
                      className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-5 py-4 hover:border-[hsl(var(--primary)/0.4)] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[hsl(var(--muted-foreground))] text-sm">{String.fromCharCode(65 + i)}</span>
                        <span className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                        <span className="text-[hsl(var(--muted-foreground))] text-sm">{p.points} pts</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'leaderboard' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border)/0.5)]">
                    {['Rank', 'User', 'Score', 'Penalty', 'Last Submit'].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-[hsl(var(--muted-foreground))] font-medium text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(leaderboardData || []).map((r: any) => (
                    <tr key={r.userId} className="border-b border-[hsl(var(--border)/0.3)] hover:bg-[hsl(var(--muted)/0.2)] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[hsl(var(--rank-gold))]">#{r.rank}</td>
                      <td className="py-3 px-3 font-medium text-[hsl(var(--foreground))]">{r.username}</td>
                      <td className="py-3 px-3 text-[hsl(var(--primary))] font-semibold">{r.totalScore}</td>
                      <td className="py-3 px-3 text-[hsl(var(--muted-foreground))]">{r.penalty}</td>
                      <td className="py-3 px-3 text-[hsl(var(--muted-foreground))]">
                        {r.lastSubmission ? new Date(r.lastSubmission).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!leaderboardData || leaderboardData.length === 0) && (
                <p className="text-center py-12 text-[hsl(var(--muted-foreground))]">No submissions yet. Be the first!</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-4">
          {/* Timer */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider">
              {isLive ? 'Time Remaining' : c.status === 'ENDED' ? 'Contest Ended' : 'Starts In'}
            </p>
            <div className="text-3xl font-display font-bold mb-3">
              {c.status !== 'ENDED' ? <Countdown target={countdownTarget} /> : <span className="text-[hsl(var(--muted-foreground))]">—</span>}
            </div>

            {/* CTA button */}
            {!isAuthenticated ? (
              <Link to="/login" className="block w-full text-center py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 transition-all">
                Sign In to Join
              </Link>
            ) : isParticipant || isAdmin ? (
              c.status === 'LIVE' ? (
                <button
                  onClick={() => setTab('problems')}
                  className="w-full py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 transition-all glow-cyan"
                >
                  Enter Arena →
                </button>
              ) : (
                <div className="py-2 text-[hsl(var(--status-accepted))] text-sm font-medium">✓ Registered</div>
              )
            ) : c.status !== 'ENDED' ? (
              <button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {registerMutation.isPending ? 'Registering...' : 'Register Now'}
              </button>
            ) : (
              <div className="py-2 text-[hsl(var(--muted-foreground))] text-sm">Contest ended</div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-3">
            {[
              ['Participants', c.participants?.length || 0],
              ['Problems', c.problems?.length || 0],
              ['Scoring', c.scoringType],
              ['Visibility', c.visibility],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="text-[hsl(var(--foreground))] font-medium">{v as string | number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
