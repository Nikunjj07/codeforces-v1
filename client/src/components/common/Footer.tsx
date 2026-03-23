import { Link } from 'react-router-dom'

export default function Footer() {
 const year = new Date().getFullYear()

 return (
 <footer className="border-t border-[hsl(var(--border)/0.4)] bg-[hsl(var(--card))] mt-auto">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
 {/* Brand */}
 <div className="col-span-2 md:col-span-1">
 <Link to="/" className="flex items-center gap-2 mb-3">
 <div className="w-7 h-7 rounded-md bg-[hsl(var(--primary))] flex items-center justify-center">
 <span className="text-[hsl(var(--primary-foreground))] font-mono font-bold text-xs">CA</span>
 </div>
 <span className="font-display font-bold text-[hsl(var(--foreground))]">
 Code<span className="text-gradient-cyan">Arena</span>
 </span>
 </Link>
 <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
 The modern competitive coding platform for students and educators.
 </p>
 </div>

 {/* Platform */}
 <div>
 <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3">Platform</h4>
 <ul className="space-y-2">
 {[['Contests', '/contests'], ['Leaderboard', '/leaderboard'], ['Dashboard', '/dashboard']].map(([label, href]) => (
 <li key={href}>
 <Link to={href} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm transition-colors">{label}</Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Account */}
 <div>
 <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3">Account</h4>
 <ul className="space-y-2">
 {[['Register', '/register'], ['Sign In', '/login'], ['Help & FAQ', '/help']].map(([label, href]) => (
 <li key={href}>
 <Link to={href} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm transition-colors">{label}</Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Legal */}
 <div>
 <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3">Legal</h4>
 <ul className="space-y-2">
 {[['Terms of Service', '/terms'], ['Privacy Policy', '/privacy']].map(([label, href]) => (
 <li key={href}>
 <Link to={href} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm transition-colors">{label}</Link>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="border-t border-[hsl(var(--border)/0.4)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
 <p className="text-[hsl(var(--muted-foreground))] text-sm">
 {year} CodeArena. All rights reserved.
 </p>
 <div className="flex items-center gap-4">
 {/* GitHub */}
 <a href="#" target="_blank" rel="noopener" aria-label="GitHub"
 className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
 </svg>
 </a>
 {/* Twitter / X */}
 <a href="#" target="_blank" rel="noopener" aria-label="Twitter"
 className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
 </svg>
 </a>
 </div>
 </div>
 </div>
 </footer>
 )
}
