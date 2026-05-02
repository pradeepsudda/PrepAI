import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }        from 'react-router-dom'
import { useQuery, useMutation }         from '@tanstack/react-query'
import Editor                            from '@monaco-editor/react'
import {
  Play, Send, ChevronDown, CheckCircle, XCircle, ArrowLeft, Loader2,
} from 'lucide-react'
import { codingApi }              from '@/services/codingApi'
import { cn }                     from '@/utils/cn'
import type { CodeExecutionResult } from '@/types'
import toast                      from 'react-hot-toast'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'go', 'typescript'] as const
type Lang = typeof LANGUAGES[number]

// Fallback starters — only used when the challenge has no starter for that language.
// All are complete, runnable programs (Judge0 requires a main entry point for Java/C++/Go).
const DEFAULT_STARTER: Record<Lang, string> = {
  javascript: [
    '// Read input from stdin and print result to stdout',
    '// Example (Node.js):',
    'const lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");',
    '',
    'function solution() {',
    '  // your solution here',
    '}',
    '',
    'console.log(solution());',
  ].join('\n'),

  python: [
    'from __future__ import annotations',
    'import sys',
    'input = sys.stdin.readline',
    '',
    'def solution():',
    '    pass  # your solution here',
    '',
    'print(solution())',
  ].join('\n'),

  java: [
    'import java.util.*;',
    'import java.io.*;',
    '',
    'public class Main {',
    '    public static void main(String[] args) throws IOException {',
    '        Scanner sc = new Scanner(System.in);',
    '        // your solution here',
    '    }',
    '}',
  ].join('\n'),

  cpp: [
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
    'int main() {',
    '    ios_base::sync_with_stdio(false);',
    '    cin.tie(NULL);',
    '    // your solution here',
    '    return 0;',
    '}',
  ].join('\n'),

  go: [
    'package main',
    '',
    'import "fmt"',
    '',
    'func main() {',
    '    // your solution here',
    '    fmt.Println("hello")',
    '}',
  ].join('\n'),

  typescript: [
    'import * as readline from "readline";',
    '',
    'const rl = readline.createInterface({ input: process.stdin });',
    'const lines: string[] = [];',
    'rl.on("line", l => lines.push(l.trim()));',
    'rl.on("close", () => {',
    '  // your solution here',
    '});',
  ].join('\n'),
}

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY:   'bg-green-500/10 text-green-400 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HARD:   'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function CodingPage() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const navigate        = useNavigate()

  const [lang, setLang]           = useState<Lang>('javascript')
  const [code, setCode]           = useState<string>(DEFAULT_STARTER['javascript'])
  const [stdin, setStdin]         = useState('')
  const [result, setResult]       = useState<CodeExecutionResult | null>(null)
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input')

  // Track which challenge we've already initialized code for, so switching
  // languages reloads the starter but we don't reset user code on unrelated re-renders.
  const loadedChallengeRef = useRef<string | null>(null)

  const { data: challenge, isLoading, isError } = useQuery({
    queryKey:  ['challenge', challengeId],
    queryFn:   () => codingApi.getChallengeById(challengeId!).then(r => r.data),
    enabled:   !!challengeId,
    staleTime: 120_000,
  })

  // Whenever the challenge loads OR the language changes → load the appropriate starter.
  useEffect(() => {
    if (!challenge) return
    const starter = challenge.starterCode?.[lang] ?? DEFAULT_STARTER[lang]
    setCode(starter)

    // Reset result panel so stale output from a previous challenge isn't shown
    if (loadedChallengeRef.current !== challenge.id) {
      loadedChallengeRef.current = challenge.id
      setResult(null)
      setStdin('')
      setActiveTab('input')
    }
  }, [challenge, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLangChange = (l: Lang) => {
    setLang(l)
    // code will be refreshed by the effect above
  }

  const runMutation = useMutation({
    mutationFn: () => codingApi.runCode(challengeId!, lang, code, stdin),
    onSuccess:  (res) => { setResult(res.data); setActiveTab('output') },
    onError:    () => toast.error('Failed to run code'),
  })

  const submitMutation = useMutation({
    mutationFn: () => codingApi.submitCode(challengeId!, lang, code),
    onSuccess:  (res) => {
      setResult(res.data)
      setActiveTab('output')
      if (res.data.status === 'Accepted')
        toast.success('All test cases passed! 🎉')
      else
        toast.error(`${res.data.passedTests}/${res.data.totalTests} tests passed`)
    },
    onError: () => toast.error('Submission failed'),
  })

  const isRunning = runMutation.isPending || submitMutation.isPending

  if (!challengeId) { navigate('/coding'); return null }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    )
  }

  if (isError || !challenge) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Challenge not found.</p>
        <button onClick={() => navigate('/coding')} className="text-brand-400 text-sm hover:underline">
          ← Back to challenges
        </button>
      </div>
    )
  }

  const diffBadge = DIFFICULTY_BADGE[challenge.difficulty] ?? DIFFICULTY_BADGE.MEDIUM
  const diffLabel = challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-card border-b border-surface-border shrink-0">
        <button
          onClick={() => navigate('/coding')}
          className="text-gray-400 hover:text-white transition-colors"
          title="Back to challenges"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="font-display font-semibold text-white text-sm truncate max-w-xs">
          {challenge.title}
        </h1>
        <span className={cn('badge border text-xs shrink-0', diffBadge)}>{diffLabel}</span>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Language picker */}
          <div className="relative">
            <select
              value={lang}
              onChange={e => handleLangChange(e.target.value as Lang)}
              className="appearance-none bg-surface-raised border border-surface-border text-white
                         text-xs px-3 py-1.5 pr-7 rounded-lg focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => runMutation.mutate()}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500
                       disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            {runMutation.isPending
              ? <Loader2 size={12} className="animate-spin" />
              : <Play    size={12} />}
            Run
          </button>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500
                       disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            {submitMutation.isPending
              ? <Loader2 size={12} className="animate-spin" />
              : <Send    size={12} />}
            Submit
          </button>
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Problem description */}
        <div className="w-[750px] border-r border-surface-border p-5 overflow-y-auto text-base">
          <h2 className="font-display font-bold text-white text-base mb-3">{challenge.title}</h2>

          <p className="text-gray-300 leading-relaxed mb-4">{challenge.description}</p>

          {challenge.constraints?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-2">Constraints</p>
              <ul className="text-sm text-gray-400 space-y-1">
                {challenge.constraints.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {challenge.examples?.length > 0 && (
            <div className="space-y-3 mt-6">
              {challenge.examples.map((ex, i) => (
                <div key={i} className="bg-surface-raised rounded-xl p-3 border border-surface-border">
                  <p className="text-sm text-gray-500 mb-1 font-medium">Example {i + 1}</p>
                  <p className="text-sm font-mono text-gray-300">Input: {ex.input}</p>
                  <p className="text-sm font-mono text-gray-300">Output: {ex.output}</p>
                  {ex.explanation && (
                    <p className="text-sm text-gray-500 mt-1 italic">{ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1">
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : lang}
              value={code}
              onChange={v => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize:             14,
                fontFamily:           'JetBrains Mono, monospace',
                minimap:              { enabled: false },
                lineNumbers:          'on',
                wordWrap:             'on',
                tabSize:              2,
                scrollBeyondLastLine: false,
                padding:              { top: 12 },
              }}
            />
          </div>

          {/* ── I/O panel ── */}
          <div className="h-52 border-t border-surface-border bg-surface-card shrink-0 flex flex-col">
            {/* tabs */}
            <div className="flex border-b border-surface-border shrink-0">
              {(['input', 'output'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-xs font-medium border-b-2 transition-colors capitalize',
                    activeTab === tab
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* content */}
            <div className="flex-1 overflow-auto p-3">

              {/* ── Input tab ── */}
              {activeTab === 'input' && (
                <textarea
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  className="w-full h-full bg-transparent text-gray-300 text-xs font-mono
                             resize-none focus:outline-none"
                  placeholder={"Paste your custom stdin here.\nWrite your program to read from stdin and print to stdout."}
                />
              )}

              {/* ── Output tab ── */}
              {activeTab === 'output' && !result && (
                <p className="text-xs text-gray-600 pt-1">Run your code to see output here.</p>
              )}

              {activeTab === 'output' && result && (
                <div className="space-y-2 text-xs">

                  {/* Status row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.status === 'Accepted'
                      ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                      : <XCircle    size={14} className="text-red-400 shrink-0" />}
                    <span className={cn('font-medium',
                      result.status === 'Accepted' ? 'text-green-400' : 'text-red-400',
                    )}>
                      {result.status}
                    </span>
                    {result.passedTests != null && result.totalTests != null && result.totalTests > 0 && (
                      <span className="text-gray-500">
                        {result.passedTests}/{result.totalTests} tests
                      </span>
                    )}
                    {result.runtimeMs != null && (
                      <span className="text-gray-500 ml-auto">{result.runtimeMs} ms</span>
                    )}
                  </div>

                  {/* Compile error — shown in amber */}
                  {result.compileOutput && (
                    <div>
                      <p className="text-amber-500 font-semibold mb-0.5">Compile Output</p>
                      <pre className="font-mono whitespace-pre-wrap text-amber-400 bg-amber-500/5
                                      border border-amber-500/20 rounded p-2">
                        {result.compileOutput}
                      </pre>
                    </div>
                  )}

                  {/* Runtime / stderr — shown in red */}
                  {result.stderr && (
                    <div>
                      <p className="text-red-500 font-semibold mb-0.5">Stderr</p>
                      <pre className="font-mono whitespace-pre-wrap text-red-400 bg-red-500/5
                                      border border-red-500/20 rounded p-2">
                        {result.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Standard output */}
                  {result.stdout && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-0.5">Output</p>
                      <pre className="font-mono whitespace-pre-wrap text-gray-300 bg-surface-raised
                                      border border-surface-border rounded p-2">
                        {result.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Per-test-case results (submit) */}
                  {result.testCaseResults && result.testCaseResults.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {result.testCaseResults.map(tc => (
                        <div key={tc.testCaseIndex}
                             className={cn(
                               'rounded-lg border p-2',
                               tc.passed
                                 ? 'border-green-500/20 bg-green-500/5'
                                 : 'border-red-500/20 bg-red-500/5',
                             )}
                        >
                          {/* Header row */}
                          <div className="flex items-center gap-1.5">
                            {tc.passed
                              ? <CheckCircle size={12} className="text-green-400 shrink-0" />
                              : <XCircle    size={12} className="text-red-400 shrink-0" />}
                            <span className={cn('font-medium', tc.passed ? 'text-green-400' : 'text-red-400')}>
                              Case {tc.testCaseIndex}
                            </span>
                            {tc.errorStatus && !tc.passed && (
                              <span className="text-xs text-gray-500 ml-1">— {tc.errorStatus}</span>
                            )}
                            {tc.runtimeMs != null && (
                              <span className="text-gray-600 ml-auto">{tc.runtimeMs} ms</span>
                            )}
                          </div>

                          {/* Compile error */}
                          {tc.compileOutput && (
                            <pre className="mt-1.5 text-xs font-mono whitespace-pre-wrap
                                            text-amber-400 bg-amber-500/5 border border-amber-500/20
                                            rounded p-1.5 max-h-28 overflow-auto">
                              {tc.compileOutput}
                            </pre>
                          )}

                          {/* Runtime error / stderr */}
                          {tc.stderr && (
                            <pre className="mt-1.5 text-xs font-mono whitespace-pre-wrap
                                            text-red-400 bg-red-500/5 border border-red-500/20
                                            rounded p-1.5 max-h-28 overflow-auto">
                              {tc.stderr}
                            </pre>
                          )}

                          {/* Wrong answer diff — only when there's no error */}
                          {!tc.passed && !tc.compileOutput && !tc.stderr && (
                            <div className="mt-1.5 pl-1 space-y-0.5 font-mono text-xs">
                              <div className="text-gray-500">
                                Expected: <span className="text-gray-300">{tc.expectedOutput}</span>
                              </div>
                              <div className="text-gray-500">
                                Got:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span className="text-red-400">{tc.actualOutput || '(no output)'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
