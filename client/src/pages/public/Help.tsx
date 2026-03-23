export default function Help() {
  const faqs = [
    { q: 'How do I register for a contest?', a: 'Go to the Contests page, click on a contest, and hit "Register Now". You need a CodeArena account first.' },
    { q: 'What languages are supported?', a: 'C++, Python 3, Java, and JavaScript are supported for all contests.' },
    { q: 'How is scoring calculated?', a: 'ACM-style: binary score (0 or full points) with penalty time for wrong attempts. IOI-style: partial scores based on test cases passed.' },
    { q: 'What does TLE mean?', a: 'Time Limit Exceeded — your code ran for longer than the allowed time limit for the problem.' },
    { q: 'Can I see my submission code?', a: 'Yes, visit your Dashboard and check Recent Submissions to review past code.' },
    { q: 'How do I create a new contest? (Teachers)', a: 'Sign in as a Teacher, go to Admin from the navbar, then Create Contest.' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Help & FAQ</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-10">Common questions answered.</p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
            <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors list-none">
              {faq.q}
              <span className="text-[hsl(var(--muted-foreground))] group-open:rotate-45 transition-transform text-xl">+</span>
            </summary>
            <div className="px-5 pb-4 text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
