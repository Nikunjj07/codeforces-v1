import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../services/api'

export default function ContestForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    duration: 120, scoringType: 'ACM', difficulty: 'INTERMEDIATE',
    visibility: 'PUBLIC', inviteCode: '', tags: '',
  })

  useQuery({
    queryKey: ['contest-edit', id],
    queryFn: () => api.get(`/contests/${id}`).then((r) => {
      const c = r.data.data.contest
      setForm({
        title: c.title, description: c.description,
        startTime: c.startTime?.slice(0, 16), endTime: c.endTime?.slice(0, 16),
        duration: c.duration, scoringType: c.scoringType, difficulty: c.difficulty,
        visibility: c.visibility, inviteCode: c.inviteCode || '', tags: c.tags?.join(', ') || '',
      })
      return c
    }),
    enabled: isEdit,
  })

  const mutation = useMutation({
    mutationFn: (payload: any) => isEdit
      ? api.put(`/contests/${id}`, payload)
      : api.post('/contests', payload),
    onSuccess: () => navigate('/admin/contests'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const inputClass = "w-full px-4 py-2.5 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--ring))] transition-all"
  const labelClass = "block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
        {isEdit ? 'Edit Contest' : 'New Contest'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" required value={form.title} onChange={set('title')} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea required value={form.description} onChange={set('description')} rows={4} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Time</label>
            <input type="datetime-local" required value={form.startTime} onChange={set('startTime')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>End Time</label>
            <input type="datetime-local" required value={form.endTime} onChange={set('endTime')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Duration (min)</label>
            <input type="number" value={form.duration} onChange={set('duration')} className={inputClass} min={10} />
          </div>
          <div>
            <label className={labelClass}>Scoring</label>
            <select value={form.scoringType} onChange={set('scoringType')} className={inputClass}>
              <option>ACM</option><option>IOI</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <select value={form.difficulty} onChange={set('difficulty')} className={inputClass}>
              {['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Visibility</label>
            <select value={form.visibility} onChange={set('visibility')} className={inputClass}>
              <option>PUBLIC</option><option>PRIVATE</option>
            </select>
          </div>
          {form.visibility === 'PRIVATE' && (
            <div>
              <label className={labelClass}>Invite Code</label>
              <input type="text" value={form.inviteCode} onChange={set('inviteCode')} className={inputClass} />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Tags <span className="font-normal text-[hsl(var(--muted-foreground))]">(comma-separated)</span></label>
          <input type="text" value={form.tags} onChange={set('tags')} placeholder="DP, Graphs, Math" className={inputClass} />
        </div>

        {mutation.isError && (
          <div className="p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] text-sm">
            {(mutation.error as any)?.response?.data?.message || 'Failed to save contest'}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all glow-cyan">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Contest' : 'Create Contest'}
          </button>
          <button type="button" onClick={() => navigate('/admin/contests')}
            className="px-6 py-2.5 rounded-lg bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
