import { useState }   from 'react'
import Editor          from '@monaco-editor/react'
import { Send, SkipForward, RotateCcw, ChevronDown } from 'lucide-react'
import { cn }          from '@/utils/cn'
import type { CodeLanguage } from '@/types'
 
const LANGUAGES: CodeLanguage[] = ['python', 'javascript', 'java', 'cpp', 'go', 'typescript']
 
const STARTER_CODE: Record<CodeLanguage, string> = {
  python:     '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n\n}\n',
  java:       '// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n',
  cpp:        '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  go:         '// Write your solution here\npackage main\n\nfunc solution() {\n\n}\n',
  typescript: '// Write your solution here\nfunction solution(): void {\n\n}\n',
}
 
interface Props {
  suggestedLanguage?: string
  onSubmit:  (code: string) => void
  onSkip:    () => void
  disabled?: boolean
}
 
export function CodeAnswerPanel({ suggestedLanguage, onSubmit, onSkip, disabled }: Props) {
  const initialLang = (
    LANGUAGES.includes(suggestedLanguage as CodeLanguage)
      ? suggestedLanguage
      : 'python'
  ) as CodeLanguage
 
  const [lang, setLang] = useState<CodeLanguage>(initialLang)
  const [code, setCode] = useState(STARTER_CODE[initialLang])
 
  const handleLangChange = (newLang: CodeLanguage) => {
    setLang(newLang)
    setCode(STARTER_CODE[newLang])
  }
 
  const handleSubmit = () => {
    if (code.trim().length < 10) return
    // Format submission: include language context so AI evaluates correctly
    const submission = `Language: ${lang}\n\n${code}`
    onSubmit(submission)
  }
 
  return (
    <div className="w-full max-w-4xl animate-slide-up">
 
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-card
                      border border-b-0 border-surface-border rounded-t-2xl">
 
        <span className="text-xs text-gray-500 font-medium">Language</span>
 
        {/* Language picker */}
        <div className="relative">
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value as CodeLanguage)}
            disabled={disabled}
            className="appearance-none bg-surface-raised border border-surface-border
                       text-white text-xs px-3 py-1.5 pr-7 rounded-lg
                       focus:outline-none focus:border-brand-500 cursor-pointer
                       disabled:opacity-50"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
        </div>
 
        {/* Hint badge if AI suggested a language */}
        {suggestedLanguage && (
          <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20
                           px-2 py-0.5 rounded-lg">
            Suggested: {suggestedLanguage}
          </span>
        )}
 
        {/* Reset code */}
        <button
          onClick={() => setCode(STARTER_CODE[lang])}
          disabled={disabled}
          className="ml-auto flex items-center gap-1 text-xs text-gray-500
                     hover:text-gray-300 transition-colors disabled:opacity-40"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
 
      {/* Monaco Editor */}
      <div className="border border-b-0 border-surface-border" style={{ height: 320 }}>
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
            padding:              { top: 8 },
            readOnly:             disabled,
          }}
        />
      </div>
 
      {/* Note + Actions */}
      <div className="bg-surface-card border border-surface-border rounded-b-2xl px-4 py-3">
        <p className="text-xs text-gray-600 mb-3">
          💡 Write your best solution — the AI will evaluate correctness,
          complexity, and code quality.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={disabled || code.trim().length < 10}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            <Send size={15} /> Submit Solution
          </button>
          <button
            onClick={onSkip}
            disabled={disabled}
            className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-40"
          >
            <SkipForward size={14} /> Skip
          </button>
          <span className="ml-auto text-xs text-gray-600">
            {code.split('\n').length} lines
          </span>
        </div>
      </div>
    </div>
  )
}