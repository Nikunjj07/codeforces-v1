import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Link } from 'react-router-dom'

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: 'text-[hsl(var(--status-accepted))]',
  WRONG_ANSWER: 'text-[hsl(var(--status-wrong))]',
  TIME_LIMIT_EXCEEDED: 'text-[hsl(var(--status-tle))]',
  PENDING: 'text-[hsl(var(--status-pending))]',
  COMPILATION_ERROR: 'text-[hsl(var(--status-ce))]',
  RUNTIME_ERROR: 'text-[hsl(var(--status-re))]',
}

export default function SubmissionsReview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: () => api.get('/admin/submissions', { params: { limit: 50 } }).then((r) => r.data.data),
  })

  const submissions: any[] = data?.submissions || []

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Submissions</h1>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[hsl(var(--border)/0.5)]">
                <tr>
                  {['User', 'Problem', 'Status', 'Language', 'Time', 'Submitted'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s: any) => (
                  <tr key={s._id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.1)]">
                    <td className="py-3 px-4 font-medium text-[hsl(var(--foreground))]">{s.userId?.username || '—'}</td>
                    <td className="py-3 px-4 text-[hsl(var(--foreground))]">{s.problemId?.title || '—'}</td>
                    <td className={`py-3 px-4 font-semibold font-mono text-xs ${STATUS_COLORS[s.status] || ''}`}>{s.status}</td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{s.language}</td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{s.executionTime ? `${s.executionTime}ms` : '—'}</td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{new Date(s.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {submissions.length === 0 && (
              <div className="p-12 text-center text-[hsl(var(--muted-foreground))]">No submissions yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
