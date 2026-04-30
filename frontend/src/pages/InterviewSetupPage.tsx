import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { interviewApi } from '@/services/interviewApi'
import { useInterviewStore } from '@/store/interviewStore'
import { cn } from '@/utils/cn'
import type { SessionType, Difficulty } from '@/types'
 
const TYPES: { value: SessionType; icon: string; label: string; desc: string }[] = [
  { value: 'DSA',           icon: '🧩', label: 'DSA',           desc: 'Coding problems, algorithms & data structures' },
  { value: 'SYSTEM_DESIGN', icon: '🏗️', label: 'System Design',  desc: 'Scalable systems, architecture trade-offs'     },
  { value: 'BEHAVIORAL',    icon: '🗣️', label: 'Behavioral',    desc: 'STAR method, leadership, team scenarios'        },
  { value: 'MIXED',         icon: '⚡', label: 'Mixed Round',   desc: 'Combination of all question types'               },
]
 
const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'EASY',   label: 'Easy',   desc: 'Entry level, ~1 yr exp',   color: 'border-green-500/40 bg-green-500/5 hover:border-green-500/60' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Mid level, 2-4 yr exp',    color: 'border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-500/60' },
  { value: 'HARD',   label: 'Hard',   desc: 'Senior level, 5+ yr exp',  color: 'border-red-500/40 bg-red-500/5 hover:border-red-500/60' },
]
 
export default function InterviewSetupPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { setSession } = useInterviewStore()
 
  const ls = location.state as { sessionType?: SessionType; difficulty?: Difficulty; topic?: string } | null
 
  const [type,   setType]   = useState<SessionType>(ls?.sessionType ?? 'DSA')
  const [diff,   setDiff]   = useState<Difficulty>(ls?.difficulty  ?? 'MEDIUM')
  const [topic,  setTopic]  = useState(ls?.topic ?? '')
 
  const mutation = useMutation({
    mutationFn: () => interviewApi.createSession({ sessionType: type, difficulty: diff, topic: topic || undefined }),
    onSuccess:  (res) => {
      setSession(res.data)
      navigate(`/interview/${res.data.id}`)
    },
    onError: () => toast.error('Failed to start session'),
  })
 
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Start Practice Session</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your interview round</p>
      </div>
 
      {/* Session type */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Interview Type
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'card p-4 text-left transition-all',
                type === t.value
                  ? 'border-brand-500/60 bg-brand-500/5'
                  : 'hover:border-surface-raised hover:bg-surface-raised/30',
              )}
            >
              <span className="text-2xl block mb-2">{t.icon}</span>
              <p className="text-sm font-semibold text-white">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
 
      {/* Difficulty */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Difficulty
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              onClick={() => setDiff(d.value)}
              className={cn(
                'card p-4 text-left transition-all',
                diff === d.value ? d.color + ' border-2' : 'hover:bg-surface-raised/30',
              )}
            >
              <p className="text-sm font-semibold text-white">{d.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>
 
      {/* Topic (optional) */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Topic Focus <span className="text-gray-600 normal-case font-normal">(optional)</span>
        </h2>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="input-field"
          placeholder='e.g. "Trees & Graphs", "Microservices", "Leadership"'
        />
      </div>
 
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
      >
        {mutation.isPending ? 'Starting session…' : 'Begin Interview'}
        {!mutation.isPending && <ChevronRight size={18} />}
      </button>
    </div>
  )
}