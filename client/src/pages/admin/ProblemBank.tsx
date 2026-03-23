import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

export default function ProblemBank() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', statement: '', difficulty: 'INTERMEDIATE', points: 100,
    timeLimit: 2, memoryLimit: 256, inputFormat: '', outputFormat: '', constraints: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: () => api.get('/problems', { params: { limit: 50 } }).then((r) => r.data.data).catch(() => ({ data: [] })),
  })
  const problems: any[] = (data as any)?.data || []

  const createMutation = useMutation({
    mutationFn: () => api.post('/problems', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-problems'] }); setShowForm(false) },
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const inputClass = "w-full px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--ring))] transition-all"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Problem Bank</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-all glow-cyan">
          {showForm ? 'Cancel' : '+ New Problem'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Create Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Title</label>
              <input type="text" required value={form.title} onChange={set('title')} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Problem Statement</label>
              <textarea value={form.statement} onChange={set('statement')} rows={5} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Input Format</label>
              <textarea value={form.inputFormat} onChange={set('inputFormat')} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Output Format</label>
              <textarea value={form.outputFormat} onChange={set('outputFormat')} rows={2} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Constraints</label>
              <input type="text" value={form.constraints} onChange={set('constraints')} placeholder="1 ≤ N ≤ 10^5" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={set('difficulty')} className={inputClass}>
                {['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Points</label>
              <input type="number" value={form.points} onChange={set('points')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Time Limit (s)</label>
              <input type="number" value={form.timeLimit} onChange={set('timeLimit')} step="0.5" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Memory Limit (MB)</label>
              <input type="number" value={form.memoryLimit} onChange={set('memoryLimit')} className={inputClass} />
            </div>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
            className="mt-5 px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all">
            {createMutation.isPending ? 'Creating...' : 'Create Problem'}
          </button>
        </div>
      )}

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border)/0.5)]">
              <tr>
                {['Title', 'Difficulty', 'Points', 'Time', 'Memory'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map((p: any) => (
                <tr key={p._id} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--muted)/0.1)] transition-colors">
                  <td className="py-3 px-4 font-medium text-[hsl(var(--foreground))]">{p.title}</td>
                  <td className={`py-3 px-4 text-xs font-medium diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</td>
                  <td className="py-3 px-4 text-[hsl(var(--foreground))]">{p.points}</td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.timeLimit}s</td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.memoryLimit}MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && problems.length === 0 && (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">No problems yet. Create the first one!</div>
        )}
      </div>
    </div>
  )
}
