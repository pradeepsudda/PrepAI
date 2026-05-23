import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Send, Users, Copy, LogOut, Circle,
  Mic, MicOff, Volume2, ChevronDown,
  Play, FileText, Code2, Loader2,
  CheckCircle, XCircle, ChevronUp,
} from 'lucide-react'
import { useRoomSocket }  from '@/hooks/useRoomSocket'
import { useRoomAudio }   from '@/hooks/useRoomAudio'
import { useAuthStore }   from '@/store/authStore'
import { codingApi }      from '@/services/codingApi'
import { cn }             from '@/utils/cn'
import type { RoomDto, CodeExecutionResult } from '@/types'
import toast from 'react-hot-toast'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'go', 'typescript'] as const
type Lang = typeof LANGUAGES[number]

const STARTER: Record<Lang, string> = {
  javascript: '// Write your solution here\nfunction solution() {\n\n}\n\nconsole.log(solution())',
  python:     '# Write your solution here\ndef solution():\n    pass\n\nprint(solution())',
  java:       'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
  cpp:        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
  go:         'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println()\n}',
  typescript: '// Write your solution here\nfunction solution(): void {\n\n}\n\nsolution()',
}

const DEMO_CHALLENGE_ID = '00000000-0000-0000-0000-000000000001'

type ActivePanel = 'board' | 'code'

export default function RoomPage() {
  const { roomId }      = useParams<{ roomId: string }>()
  const location        = useLocation()
  const navigate        = useNavigate()
  const { token, user } = useAuthStore()
  const room            = (location.state as { room?: RoomDto } | null)?.room

  const [activePanel, setActivePanel] = useState<ActivePanel>('board')

  const [boardText,     setBoardText]     = useState('## Discuss Approach\n\n')
  const isRemoteBoard                     = useRef(false)

  const [code,          setCode]          = useState(STARTER['javascript'])
  const [lang,          setLang]          = useState<Lang>('javascript')
  const isRemoteCode                      = useRef(false)
  const isRemoteLang                      = useRef(false)

  const [stdin,         setStdin]         = useState('')
  const [runResult,     setRunResult]     = useState<CodeExecutionResult | null>(null)
  const [isRunning,     setIsRunning]     = useState(false)
  const [outputOpen,    setOutputOpen]    = useState(true)

  const [message,       setMsg]           = useState('')
  const chatEndRef                        = useRef<HTMLDivElement>(null)

  const handleRemoteLang = useCallback((remoteLang: string) => {
    if (remoteLang !== lang) {
      isRemoteLang.current = true
      setLang(remoteLang as Lang)
    }
  }, [lang])

  const {
    messages, participants, sharedCode, connected, error,
    sendMessage, syncCode, sendWebRtcSignal, onWebRtcSignalRef,
  } = useRoomSocket(roomId!, token!, handleRemoteLang)

  const {
    audioEnabled, muted, speaking, audioError,
    enableAudio, disableAudio, toggleMute,
  } = useRoomAudio(
    user?.email ?? '',
    participants,
    sendWebRtcSignal,
    onWebRtcSignalRef,
  )

  useEffect(() => {
    if (!sharedCode) return

    if (sharedCode.startsWith('BOARD::')) {
      const content = sharedCode.slice(7)
      if (content !== boardText) {
        isRemoteBoard.current = true
        setBoardText(content)
      }
    } else {
      if (sharedCode !== code) {
        isRemoteCode.current = true
        setCode(sharedCode)
      }
    }
  }, [sharedCode]) 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => { if (error)      toast.error(error)      }, [error])
  useEffect(() => { if (audioError) toast.error(audioError) }, [audioError])

  const handleBoardChange = (val: string) => {
    if (isRemoteBoard.current) { isRemoteBoard.current = false; return }
    setBoardText(val)
    syncCode('BOARD::' + val, lang)
  }

  const handleCodeChange = (val: string | undefined) => {
    if (isRemoteCode.current) { isRemoteCode.current = false; return }
    const v = val ?? ''
    setCode(v)
    syncCode(v, lang)
  }

  const handleLangChange = (newLang: Lang) => {
    if (isRemoteLang.current) { isRemoteLang.current = false; return }
    setLang(newLang)
    setCode(STARTER[newLang])
    syncCode(STARTER[newLang], newLang)
  }

  const handleRun = async () => {
    if (!code.trim()) return
    setIsRunning(true)
    setRunResult(null)
    setOutputOpen(true)

    try {
      const { data } = await codingApi.runCode(
        DEMO_CHALLENGE_ID,
        lang,
        code,
        stdin || undefined,
      )
      setRunResult(data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Execution failed'
      toast.error(msg)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSend = () => {
    const text = message.trim()
    if (!text || !connected) return
    sendMessage(text)
    setMsg('')
  }

  const displayName = (email: string) =>
    email.includes('@') ? email.split('@')[0] : email

  const formatTime = (ts: number) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  const statusColor = (status?: string) => {
    if (!status) return 'text-gray-400'
    if (status.toLowerCase().includes('accept')) return 'text-green-400'
    if (status.toLowerCase().includes('error') ||
        status.toLowerCase().includes('wrong'))  return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">

      {/* ════ HEADER ════════════════════════════════════════════ */}
      <header className="flex items-center gap-3 px-4 py-2 bg-surface-card
                         border-b border-surface-border flex-shrink-0 flex-wrap min-h-[48px]">

        {/* Connection dot */}
        <div className="flex items-center gap-1.5">
          <Circle size={7} className={cn(
            connected ? 'fill-green-400 text-green-400'
                      : 'fill-yellow-400 text-yellow-400 animate-pulse',
          )} />
          <span className="text-xs text-gray-500">
            {connected ? 'Connected' : 'Connecting…'}
          </span>
        </div>

        {/* Room code */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(room?.roomCode ?? roomId ?? '')
            toast.success('Copied!')
          }}
          className="flex items-center gap-1 font-mono text-sm text-brand-400 hover:text-brand-300"
        >
          {room?.roomCode ?? roomId?.slice(0, 8)}
          <Copy size={11} />
        </button>

        {/* Participants with speaking indicator */}
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-gray-500" />
          <span className="text-xs text-gray-400">{participants.length} online</span>
          <div className="flex gap-1">
            {participants.map(p => (
              <span
                key={p}
                title={p}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border transition-all',
                  speaking.includes(p)
                    ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
                    : 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                )}
              >
                {displayName(p)}
                {speaking.includes(p) && <Volume2 size={9} className="inline ml-0.5" />}
              </span>
            ))}
          </div>
        </div>

        {/* Panel toggle */}
        <div className="flex items-center bg-surface-raised border border-surface-border
                        rounded-lg p-0.5 ml-2">
          <button
            onClick={() => setActivePanel('board')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activePanel === 'board'
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            <FileText size={12} /> Board
          </button>
          <button
            onClick={() => setActivePanel('code')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activePanel === 'code'
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            <Code2 size={12} /> Code
          </button>
        </div>

        {/* Language picker — only shown in code mode */}
        {activePanel === 'code' && (
          <div className="relative">
            <select
              value={lang}
              onChange={e => handleLangChange(e.target.value as Lang)}
              className="appearance-none bg-surface-raised border border-surface-border
                         text-white text-xs px-3 py-1.5 pr-7 rounded-lg cursor-pointer
                         focus:outline-none focus:border-brand-500"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Run button — only in code mode */}
        {activePanel === 'code' && (
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500
                       disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            {isRunning
              ? <Loader2 size={12} className="animate-spin" />
              : <Play size={12} />}
            {isRunning ? 'Running…' : 'Run'}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Audio controls */}
        {audioEnabled ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className={cn(
                'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all',
                muted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-green-500/20 border-green-500/40 text-green-400',
              )}
            >
              {muted ? <MicOff size={12} /> : <Mic size={12} />}
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={disableAudio}
              className="text-xs px-2 py-1.5 rounded-lg border border-red-500/30
                         text-red-400 hover:bg-red-500/10 transition-all"
            >
              End
            </button>
          </div>
        ) : (
          <button
            onClick={enableAudio}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border
                       border-surface-border text-gray-400 hover:text-white
                       hover:border-brand-500/40 transition-all"
          >
            <MicOff size={12} /> Voice
          </button>
        )}

        {/* Leave */}
        <button
          onClick={() => navigate('/rooms')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={13} /> Leave
        </button>
      </header>

      {/* ════ BODY ══════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Main panel (Board or Code) ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── BOARD PANEL ────────────────────────────────── */}
          {activePanel === 'board' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Board header */}
              <div className="px-4 py-2 border-b border-surface-border bg-surface-card
                              flex items-center gap-2 flex-shrink-0">
                <FileText size={13} className="text-brand-400" />
                <span className="text-xs font-medium text-gray-300">Discussion Board</span>
                <span className="text-xs text-gray-600 ml-2">
                  — Write notes, discuss approach, draw with text
                </span>
                <span className="text-xs text-gray-600 ml-auto">
                  Syncs in real-time
                </span>
              </div>

              {/* Board textarea */}
              <textarea
                value={boardText}
                onChange={e => handleBoardChange(e.target.value)}
                className="flex-1 w-full bg-surface p-5 text-gray-200 text-sm
                           font-mono leading-relaxed resize-none
                           focus:outline-none border-0"
                placeholder={`Discuss your approach here...\n\nExample:\n## Problem Analysis\n- Input: ...\n- Output: ...\n- Edge cases: ...\n\n## Approach\n1. First, ...\n2. Then, ...\n\n## Complexity\n- Time: O(...)\n- Space: O(...)`}
                spellCheck={false}
              />
            </div>
          )}

          {/* ── CODE PANEL ─────────────────────────────────── */}
          {activePanel === 'code' && (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Monaco Editor */}
              <div className={cn(
                'flex-1 overflow-hidden transition-all',
                outputOpen ? 'basis-[60%]' : 'basis-full',
              )}>
                <Editor
                  height="100%"
                  language={lang === 'cpp' ? 'cpp' : lang}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    fontSize:             14,
                    fontFamily:           'JetBrains Mono, monospace',
                    minimap:              { enabled: false },
                    lineNumbers:          'on',
                    wordWrap:             'on',
                    tabSize:              2,
                    scrollBeyondLastLine: false,
                    padding:              { top: 10 },
                  }}
                />
              </div>

              {/* ── I/O + Output section ── */}
              <div className={cn(
                'flex flex-col border-t border-surface-border bg-surface-card',
                'transition-all duration-200',
                outputOpen ? 'h-64' : 'h-9',
              )}>
                {/* Section header */}
                <div className="flex items-center gap-3 px-3 py-2 border-b border-surface-border flex-shrink-0">
                  <button
                    onClick={() => setOutputOpen(!outputOpen)}
                    className="flex items-center gap-1 text-xs text-gray-400
                               hover:text-white transition-colors"
                  >
                    {outputOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    I/O Console
                  </button>

                  {/* Execution status */}
                  {runResult && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {runResult.status?.toLowerCase().includes('accept')
                        ? <CheckCircle size={12} className="text-green-400" />
                        : <XCircle    size={12} className="text-red-400" />}
                      <span className={cn('text-xs font-medium', statusColor(runResult.status))}>
                        {runResult.status}
                      </span>
                      {runResult.runtimeMs && (
                        <span className="text-xs text-gray-500">
                          · {runResult.runtimeMs}ms
                        </span>
                      )}
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <Loader2 size={12} className="text-brand-400 animate-spin" />
                      <span className="text-xs text-brand-400">Running…</span>
                    </div>
                  )}
                </div>

                {/* I/O panels */}
                {outputOpen && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Stdin */}
                    <div className="flex-1 flex flex-col border-r border-surface-border">
                      <p className="text-xs text-gray-500 px-3 py-1 border-b
                                    border-surface-border bg-surface flex-shrink-0">
                        Input
                      </p>
                      <textarea
                        value={stdin}
                        onChange={e => setStdin(e.target.value)}
                        className="flex-1 bg-transparent text-gray-300 text-xs
                                   font-mono p-3 resize-none focus:outline-none"
                        placeholder="Custom test input…"
                      />
                    </div>

                    {/* Stdout */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-xs text-gray-500 px-3 py-1 border-b
                                    border-surface-border bg-surface flex-shrink-0">
                        Output
                      </p>
                      <pre className="flex-1 text-xs font-mono p-3 overflow-auto
                                      text-gray-300 whitespace-pre-wrap">
                        {isRunning
                          ? 'Running…'
                          : runResult
                            ? (runResult.stdout
                              || runResult.stderr
                              || runResult.compileOutput
                              || '(no output)')
                            : 'Click Run to execute your code'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar: Chat ── */}
        <div className="w-[448px] flex-shrink-0 flex flex-col border-l border-surface-border bg-surface-card">

          {/* Chat header */}
          <div className="px-3 py-2.5 border-b border-surface-border flex-shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Chat
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-6">
                {connected ? 'No messages yet 👋' : 'Connecting…'}
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender === user?.email
              return (
                <div
                  key={i}
                  className={cn('flex flex-col gap-0.5', isMe ? 'items-end' : 'items-start')}
                >
                  <span className="text-xs text-gray-500 px-1">
                    {isMe ? 'You' : displayName(msg.sender)}
                  </span>
                  <div className={cn(
                    'rounded-xl px-3 py-2 text-xs break-words max-w-[95%]',
                    isMe
                      ? 'bg-brand-600/20 text-brand-100'
                      : 'bg-surface-raised text-gray-300 border border-surface-border',
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-700 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-surface-border flex-shrink-0">
            <div className="flex gap-1.5">
              <input
                value={message}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={connected ? 'Message…' : 'Connecting…'}
                disabled={!connected}
                className="input-field flex-1 py-2 text-xs disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || !connected}
                className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40
                           rounded-xl text-white transition-colors flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}