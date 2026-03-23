import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import Editor from '@monaco-editor/react'
import api from '../../services/api'

const LANGUAGES = [
 { id: 'cpp', label: 'C++' },
 { id: 'python', label: 'Python' },
 { id: 'java', label: 'Java' },
 { id: 'javascript', label: 'JavaScript' },
]

const STARTER_CODE: Record<string, string> = {
 cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
 // Your code here
 return 0;
}`,
 python: `# Your code here\n`,
 java: `import java.util.Scanner;
public class Main {
 public static void main(String[] args) {
 Scanner sc = new Scanner(System.in);
 // Your code here
 }
}`,
 javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');
// Your code here`,
}

export default function ProblemSolve() {
 const { id: contestId, problemId } = useParams<{ id: string; problemId: string }>()
 const navigate = useNavigate()

 const [lang, setLang] = useState('cpp')
 const [code, setCode] = useState(STARTER_CODE.cpp)
 const [customInput, setCustomInput] = useState('')
 const [runOutput, setRunOutput] = useState<string | null>(null)
 const [submissionStatus, setSubmissionStatus] = useState<string | null>(null)
 const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

 useEffect(() => { setCode(STARTER_CODE[lang] || '') }, [lang])

 const { data: problem, isLoading } = useQuery({
 queryKey: ['problem', problemId],
 queryFn: () => api.get(`/contests/${contestId}/problems`).then((r) =>
 r.data.data.problems.find((p: any) => p._id === problemId)
 ),
 })

 const submitMutation = useMutation({
 mutationFn: () => api.post(`/contests/${contestId}/problems/${problemId}/submit`, { language: lang, code }),
 onSuccess: ({ data }) => {
 const subId = data.data.submissionId
 setSubmissionStatus('PENDING')
 // Poll for result
 pollRef.current = setInterval(async () => {
 try {
 const { data: sub } = await api.get(`/problems/submissions/${subId}`)
 if (sub.data.submission.status !== 'PENDING') {
 setSubmissionStatus(sub.data.submission.status)
 clearInterval(pollRef.current!)
 }
 } catch { clearInterval(pollRef.current!) }
 }, 2000)
 },
 })

 useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

 const STATUS_COLORS: Record<string, string> = {
 ACCEPTED: 'text-[hsl(var(--status-accepted))]',
 WRONG_ANSWER: 'text-[hsl(var(--status-wrong))]',
 TIME_LIMIT_EXCEEDED: 'text-[hsl(var(--status-tle))]',
 PENDING: 'text-[hsl(var(--status-pending))] animate-pulse',
 COMPILATION_ERROR: 'text-[hsl(var(--status-ce))]',
 RUNTIME_ERROR: 'text-[hsl(var(--status-re))]',
 }

 if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
 if (!problem) return <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">Problem not found</div>

 return (
 <div className="flex flex-col h-[calc(100svh-4rem)] overflow-hidden">
 {/* Top bar */}
 <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--card))] border-b border-[hsl(var(--border)/0.5)] shrink-0">
 <div className="flex items-center gap-3">
 <button onClick={() => navigate(-1)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm">←</button>
 <span className="font-display font-semibold text-[hsl(var(--foreground))] text-sm">{problem.title}</span>
 <span className={`text-xs font-medium diff-${problem.difficulty?.toLowerCase()}`}>{problem.difficulty}</span>
 <span className="text-xs text-[hsl(var(--muted-foreground))]">{problem.points} pts</span>
 </div>

 {submissionStatus && (
 <span className={`text-sm font-semibold font-mono ${STATUS_COLORS[submissionStatus] || ''}`}>
 {submissionStatus === 'PENDING' ? ' Judging...' : submissionStatus.replace(/_/g, ' ')}
 </span>
 )}
 </div>

 {/* 3-panel layout */}
 <div className="flex flex-1 overflow-hidden">
 {/* Left: Problem statement */}
 <div className="w-[35%] min-w-[280px] border-r border-[hsl(var(--border)/0.5)] overflow-y-auto p-5 space-y-4 scrollbar-hide">
 <div>
 <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))] mb-1">{problem.title}</h2>
 <p className="text-[hsl(var(--foreground))] text-sm leading-relaxed whitespace-pre-wrap">{problem.statement}</p>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Input Format</h3>
 <p className="text-sm text-[hsl(var(--foreground))]">{problem.inputFormat}</p>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Output Format</h3>
 <p className="text-sm text-[hsl(var(--foreground))]">{problem.outputFormat}</p>
 </div>
 <div>
 <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Constraints</h3>
 <pre className="text-sm text-[hsl(var(--foreground))] font-mono bg-[hsl(var(--muted)/0.5)] rounded p-2">{problem.constraints}</pre>
 </div>
 {problem.sampleTestCases?.map((tc: any, i: number) => (
 <div key={i}>
 <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Example {i + 1}</h3>
 <div className="space-y-1">
 <div>
 <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-0.5">Input</p>
 <pre className="text-xs bg-[hsl(var(--muted)/0.5)] rounded p-2 font-mono text-[hsl(var(--foreground))]">{tc.input}</pre>
 </div>
 <div>
 <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-0.5">Output</p>
 <pre className="text-xs bg-[hsl(var(--muted)/0.5)] rounded p-2 font-mono text-[hsl(var(--foreground))]">{tc.output}</pre>
 </div>
 {tc.explanation && <p className="text-xs text-[hsl(var(--muted-foreground))]">{tc.explanation}</p>}
 </div>
 </div>
 ))}
 </div>

 {/* Center: Editor */}
 <div className="flex-1 flex flex-col overflow-hidden">
 {/* Language selector */}
 <div className="flex items-center gap-3 px-4 py-2 bg-[hsl(var(--card))] border-b border-[hsl(var(--border)/0.5)]">
 <select value={lang} onChange={(e) => setLang(e.target.value)}
 className="bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[hsl(var(--ring))]">
 {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
 </select>
 <span className="text-xs text-[hsl(var(--muted-foreground))]">Ctrl+Enter to submit</span>
 </div>

 <div className="flex-1 overflow-hidden">
 <Editor
 height="100%"
 language={lang === 'cpp' ? 'cpp' : lang}
 value={code}
 onChange={(v) => setCode(v || '')}
 theme="vs-dark"
 options={{
 fontSize: 14,
 fontFamily: "'JetBrains Mono', monospace",
 minimap: { enabled: false },
 scrollBeyondLastLine: false,
 lineNumbers: 'on',
 glyphMargin: false,
 folding: true,
 tabSize: 4,
 wordWrap: 'on',
 }}
 onMount={(editor) => {
 editor.addCommand(2099, () => submitMutation.mutate()) // Ctrl+Enter
 }}
 />
 </div>

 {/* Bottom action bar */}
 <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--card))] border-t border-[hsl(var(--border)/0.5)] shrink-0">
 <div className="text-xs text-[hsl(var(--muted-foreground))]">
 Time: {problem.timeLimit}s · Memory: {problem.memoryLimit}MB
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => {
 setRunOutput(' Run feature coming soon — use Submit to judge against all test cases.')
 }}
 className="px-4 py-2 rounded-lg bg-[hsl(var(--muted)/0.5)] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
 >
 Run
 </button>
 <button
 onClick={() => submitMutation.mutate()}
 disabled={submitMutation.isPending}
 className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all glow-cyan"
 >
 {submitMutation.isPending ? 'Submitting...' : 'Submit'}
 </button>
 </div>
 </div>
 </div>

 {/* Right: Test cases */}
 <div className="w-[25%] min-w-[200px] border-l border-[hsl(var(--border)/0.5)] flex flex-col overflow-hidden">
 <div className="px-4 py-2.5 border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]">
 <p className="text-sm font-medium text-[hsl(var(--foreground))]">Test Cases</p>
 </div>
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 <div>
 <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] block mb-1">Custom Input</label>
 <textarea
 value={customInput}
 onChange={(e) => setCustomInput(e.target.value)}
 rows={5}
 className="w-full bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg p-2 text-sm font-mono text-[hsl(var(--foreground))] resize-none focus:outline-none focus:border-[hsl(var(--ring))]"
 placeholder="Enter test input..."
 />
 </div>
 {runOutput && (
 <div>
 <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] block mb-1">Output</label>
 <pre className="bg-[hsl(var(--muted)/0.5)] rounded-lg p-2 text-xs font-mono text-[hsl(var(--foreground))] overflow-x-auto">{runOutput}</pre>
 </div>
 )}
 {submissionStatus && (
 <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-3">
 <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Last Submission</p>
 <p className={`font-semibold font-mono text-sm ${STATUS_COLORS[submissionStatus] || ''}`}>
 {submissionStatus.replace(/_/g, ' ')}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
