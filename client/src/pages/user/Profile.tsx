import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

export default function Profile() {
 const { username } = useParams<{ username: string }>()

 const { data: user, isLoading } = useQuery({
 queryKey: ['profile', username],
 queryFn: () => api.get(`/users/${username}`).then((r) => r.data.data.user).catch(() => null),
 })

 if (isLoading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" /></div>
 if (!user) return <div className="text-center py-24 text-[hsl(var(--muted-foreground))]">User not found</div>

 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
 <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.15)] border-2 border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] font-display text-4xl font-bold">
 {user.username?.[0]?.toUpperCase()}
 </div>
 <div>
 <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{user.username}</h1>
 {user.profile?.bio && <p className="text-[hsl(var(--muted-foreground))] mt-1 max-w-md">{user.profile.bio}</p>}
 <div className="flex flex-wrap gap-4 mt-2 text-sm text-[hsl(var(--muted-foreground))]">
 {user.profile?.institution && <span> {user.profile.institution}</span>}
 {user.profile?.country && <span> {user.profile.country}</span>}
 <span className="text-[hsl(var(--primary))] font-semibold"> {user.rating} rating</span>
 </div>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
 {[
 { label: 'Solved', value: user.stats?.solved ?? 0, icon: '' },
 { label: 'Contests', value: user.stats?.contests ?? 0, icon: '' },
 { label: 'Wins', value: user.stats?.wins ?? 0, icon: '' },
 { label: 'Streak', value: `${user.stats?.streak ?? 0}d`, icon: '' },
 ].map(({ label, value, icon }) => (
 <div key={label} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 text-center">
 <span className="text-2xl">{icon}</span>
 <p className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{value}</p>
 <p className="text-[hsl(var(--muted-foreground))] text-xs">{label}</p>
 </div>
 ))}
 </div>
 </div>
 )
}
