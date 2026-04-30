import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { Send, Users, Copy, LogOut, Circle, ChevronDown } from 'lucide-react'
import { useRoomSocket } from '@/hooks/useRoomSocket'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import type { RoomDto } from '@/types'
import toast from 'react-hot-toast'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'go', 'typescript'] as const
type Lang = typeof LANGUAGES[number]

export default function RoomPage() {
  const { roomId }      = useParams<{ roomId: string }>()
  const location        = useLocation()
  const navigate        = useNavigate()
  const { token, user } = useAuthStore()
  const room            = (location.state as { room?: RoomDto } | null)?.room

  const [code, setCode]     = useState('// Start coding together!\n')
  const [lang, setLang]     = useState<Lang>('javascript')
  const [message, setMsg]   = useState('')
  const chatEndRef          = useRef<HTMLDivElement>(null)
  const isRemoteUpdate      = useRef(false)

  const { messages, participants, sharedCode, connected, sendMessage, syncCode } =
    useRoomSocket(roomId!, token!)

  // Apply incoming remote code without re-broadcasting
  useEffect(() => {
    if (sharedCode && sharedCode !== code) {
      isRemoteUpdate.current = true
      setCode(sharedCode)
    }
  }, [sharedCode]) // eslint-disable-line

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCodeChange = (val: string | undefined) => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return }
    const v = val ?? ''
    setCode(v)
    syncCode(v, lang)
  }

  const handleSend = () => {
    const text = message.trim()
    if (!text) return
    sendMessage(text)
    setMsg('')
  }

  const copyCode = () => {
    if (!room) return
    navigator.clipboard.writeText(room.roomCode)
    toast.success('Room code copied!')
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center gap-4 px-5 py-3 bg-surface-card border-b border-surface-border flex-shrink-0">
        {/* Connection status */}
        <Circle
          size={8}
          className={cn(
            connected ? 'fill-green-400 text-green-400' : 'fill-yellow-400 text-yellow-400',
            'flex-shrink-0'
          )}
        />

        {/* Room code */}
        {room ? (
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors"
            title="Copy room code"
          >
            {room.roomCode}
            <Copy size={12} />
          </button>
        ) : (
          <span className="text-sm text-gray-400 font-mono">{roomId}</span>
        )}

        {/* Participants */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} />
          <span>{participants.length || (room?.participantCount ?? 0)} online</span>
        </div>

        {/* Language picker */}
        <div className="relative ml-auto">
          <select
            value={lang}
            onChange={e => setLang(e.target.value as Lang)}
            className="appearance-none bg-surface-raised border border-surface-border text-white
                       text-xs px-3 py-1.5 pr-7 rounded-lg focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Leave */}
        <button
          onClick={() => navigate('/rooms')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> Leave
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={lang}
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
              padding:              { top: 12 },
            }}
          />
        </div>

        {/* Chat sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col border-l border-surface-border bg-surface-card">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-surface-border">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Chat
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-8">
                No messages yet — say hi!
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender === user?.fullName
              return (
                <div key={i} className={cn('flex flex-col gap-0.5', isMe ? 'items-end' : 'items-start')}>
                  <span className="text-xs text-gray-600 px-1">{msg.sender}</span>
                  <div className={cn(
                    'rounded-xl px-3 py-2 text-xs break-words max-w-[95%]',
                    isMe
                      ? 'bg-brand-600/20 text-brand-100'
                      : 'bg-surface-raised text-gray-300 border border-surface-border',
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-700 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-surface-border">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message…"
                className="input-field flex-1 py-2 text-xs"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40
                           rounded-xl text-white transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
