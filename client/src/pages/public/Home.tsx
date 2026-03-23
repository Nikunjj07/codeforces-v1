import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

// ── Particle canvas background ────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []
    const N = 60

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        a: Math.random(),
      })
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(189, 94%, 43%, ${p.a * 0.6})`
        ctx.fill()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `hsla(189, 94%, 43%, ${(1 - dist / 120) * 0.15})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ── Animated counter ─────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        start = Math.min(start + step, target)
        setCount(start)
        if (start >= target) clearInterval(timer)
      }, 16)
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Contest status badge ──────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    LIVE: 'bg-[hsl(var(--status-accepted)/0.15)] text-[hsl(var(--status-accepted))] border-[hsl(var(--status-accepted)/0.3)]',
    UPCOMING: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]',
    ENDED: 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.ENDED}`}>
      {status === 'LIVE' && '● '}{status}
    </span>
  )
}

// ── Countdown timer ───────────────────────────────────────
function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(0)
  useEffect(() => {
    const update = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [target])

  if (diff === 0) return <span className="text-xs text-[hsl(var(--muted-foreground))]">Ended</span>
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return <span className="font-mono text-sm text-[hsl(var(--primary))]">{h}h {m}m {s}s</span>
}

// ── Home page ─────────────────────────────────────────────
export default function Home() {
  const { data: contestsData } = useQuery({
    queryKey: ['featured-contests'],
    queryFn: () => api.get('/contests?limit=3&status=LIVE').then((r) => r.data.data),
  })

  const featured = contestsData?.data || []

  const steps = [
    { n: '01', title: 'Register', desc: 'Create your account in seconds. No credit card needed.' },
    { n: '02', title: 'Join a Contest', desc: 'Browse live, upcoming, and past contests. Register with one click.' },
    { n: '03', title: 'Climb the Leaderboard', desc: 'Submit solutions, earn points, and rise through the global rankings.' },
  ]

  const testimonials = [
    { name: 'Priya S.', school: 'IIT Bombay', quote: 'The best platform for practice contests. Clean UI, fast judging.' },
    { name: 'Ali K.', school: 'BITS Pilani', quote: 'Our professor runs all department contests here. It just works.' },
    { name: 'Lena M.', school: 'NIT Trichy', quote: 'Jumped from 1200 to 1650 rating in two months. Incredibly motivating.' },
  ]

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[90svh] flex items-center justify-center overflow-hidden">
        <ParticleCanvas />
        {/* Grid overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background)/0)] via-[hsl(var(--background)/0.4)] to-[hsl(var(--background))]" />

        <div className="relative z-10 text-center px-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--status-accepted))] animate-pulse" />
            Platform Live · 1,200+ Active Coders
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6">
            <span className="text-gradient-cyan-white">Code.</span>{' '}
            <span className="text-gradient-cyan-white">Compete.</span>{' '}
            <span className="text-gradient-cyan">Conquer.</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg sm:text-xl max-w-xl mx-auto mb-10 font-body">
            The modern coding contest platform for students and educators. Built for speed, designed to impress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contests"
              className="px-8 py-3.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-base hover:opacity-90 transition-all glow-cyan shadow-md"
            >
              Browse Contests
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-glass border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold text-base hover:border-[hsl(var(--primary)/0.5)] transition-all"
            >
              Start Competing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="bg-[hsl(var(--card))] border-y border-[hsl(var(--border)/0.5)] py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Contests Hosted', target: 240, suffix: '+' },
            { label: 'Active Participants', target: 12000, suffix: '+' },
            { label: 'Problems Solved', target: 450000, suffix: '+' },
            { label: 'Countries', target: 48, suffix: '' },
          ].map(({ label, target, suffix }) => (
            <div key={label}>
              <p className="font-display text-4xl font-bold text-gradient-cyan mb-1">
                <AnimatedCounter target={target} suffix={suffix} />
              </p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Contests ──────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Featured Contests</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">Jump into a competition, right now.</p>
          </div>
          <Link to="/contests" className="text-[hsl(var(--primary))] text-sm font-medium hover:underline">View all →</Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.length > 0 ? featured.map((c: any) => (
            <Link
              key={c._id}
              to={`/contests/${c._id}`}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 hover:border-[hsl(var(--primary)/0.4)] hover:glow-cyan transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={c.status} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{c.difficulty}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors mb-1">{c.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>{c.participants?.length || 0} participants</span>
                {c.endTime && <Countdown target={c.endTime} />}
              </div>
            </Link>
          )) : (
            // Skeleton placeholders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-[hsl(var(--muted))] rounded w-16 mb-3" />
                <div className="h-5 bg-[hsl(var(--muted))] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[hsl(var(--muted))] rounded w-full mb-1" />
                <div className="h-3 bg-[hsl(var(--muted))] rounded w-2/3" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-[hsl(var(--card))]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-3 text-[hsl(var(--foreground))]">How It Works</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-center mb-12">Three steps to start competing.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center mx-auto mb-4">
                  <span className="font-mono text-[hsl(var(--primary))] font-bold text-xl">{s.n}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[hsl(var(--foreground))] mb-2">{s.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto w-full">
        <h2 className="font-display text-3xl font-bold text-center mb-12 text-[hsl(var(--foreground))]">What Coders Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
              <p className="text-[hsl(var(--foreground))] text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] font-semibold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[hsl(var(--foreground))] text-sm font-medium">{t.name}</p>
                  <p className="text-[hsl(var(--muted-foreground))] text-xs">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center bg-[hsl(var(--card))] border border-[hsl(var(--primary)/0.2)] rounded-2xl p-12 glow-cyan">
          <h2 className="font-display text-4xl font-bold text-gradient-cyan mb-4">Ready to compete?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">Join thousands of students already sharpening their skills on CodeArena.</p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-lg hover:opacity-90 transition-all glow-cyan"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
