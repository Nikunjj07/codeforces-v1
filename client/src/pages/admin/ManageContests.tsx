import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ManageContests() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contests', page],
    queryFn: () => api.get('/contests', { params: { page, limit: 20 } }).then((r) => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contests/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contests'] }),
  })

  const contests: any[] = data?.data || []

  const statusColor: Record<string, string> = {
    LIVE: 'text-[hsl(var(--status-accepted))]',
    PUBLISHED: 'text-[hsl(var(--primary))]',
    ENDED: 'text-[hsl(var(--muted-foreground))]',
    DRAFT: 'text-[hsl(var(--muted-foreground))]',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Manage Contests</h1>
        <Link to="/admin/contests/new" className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-all glow-cyan">
          + New Contest
        </Link>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border)/0.5)]">
              <tr>
                {['Title', 'Status', 'Participants', 'Start', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contests.map((c: any) => (
                <tr key={c._id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.1)] transition-colors">
                  <td className="py-3 px-4 font-medium text-[hsl(var(--foreground))]">{c.title}</td>
                  <td className={`py-3 px-4 font-semibold text-xs ${statusColor[c.status] || ''}`}>{c.status}</td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{c.participants?.length ?? 0}</td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{new Date(c.startTime).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link to={`/admin/contests/${c._id}/edit`} className="text-[hsl(var(--primary))] hover:underline text-xs font-medium">Edit</Link>
                      <button
                        onClick={() => { if (window.confirm('Delete this contest?')) deleteMutation.mutate(c._id) }}
                        className="text-[hsl(var(--destructive))] hover:underline text-xs font-medium"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
