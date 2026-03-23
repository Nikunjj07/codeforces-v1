import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

export default function ManageUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/admin/users', { params: { search: search || undefined } }).then((r) => r.data.data),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/ban`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users: any[] = data?.users || []

  const roleColors: Record<string, string> = {
    ADMIN: 'text-[hsl(var(--secondary))]',
    TEACHER: 'text-[hsl(var(--primary))]',
    STUDENT: 'text-[hsl(var(--muted-foreground))]',
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Manage Users</h1>

      <input
        type="text" placeholder="Search by username or email..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] transition-all"
      />

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[hsl(var(--border)/0.5)]">
                <tr>
                  {['User', 'Email', 'Role', 'Rating', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.1)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))] text-xs font-bold">{u.username?.[0]?.toUpperCase()}</div>
                        <span className="font-medium text-[hsl(var(--foreground))] truncate max-w-[120px]">{u.username}</span>
                        {!u.isActive && <span className="px-1.5 py-0.5 bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] text-[10px] rounded font-semibold">BANNED</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))] truncate max-w-[160px]">{u.email}</td>
                    <td className={`py-3 px-4 font-semibold text-xs ${roleColors[u.role] || ''}`}>{u.role}</td>
                    <td className="py-3 px-4 text-[hsl(var(--foreground))]">{u.rating}</td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => roleMutation.mutate({ id: u._id, role: u.role === 'STUDENT' ? 'TEACHER' : 'STUDENT' })}
                          className="text-xs text-[hsl(var(--primary))] hover:underline"
                        >
                          {u.role === 'STUDENT' ? 'Make Teacher' : 'Make Student'}
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`Ban ${u.username}?`)) banMutation.mutate(u._id) }}
                          className="text-xs text-[hsl(var(--destructive))] hover:underline"
                        >Ban</button>
                      </div>
                    </td>
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
