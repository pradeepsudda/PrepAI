import { useParams, useNavigate } from 'react-router-dom'
import { useQuery }               from '@tanstack/react-query'
import { interviewApi }           from '@/services/interviewApi'
import { PageHeader }             from '@/components/ui/PageHeader'
import { ScoreCircle }            from '@/components/ui/ScoreCircle'
import { ProgressBar }            from '@/components/ui/ProgressBar'
import { Badge }                  from '@/components/ui/Badge'
import { PageLoader }             from '@/components/ui/LoadingSpinner'
import { formatDuration, difficultyColor, sessionTypeLabel, sessionTypeIcon } from '@/utils/format'
import { cn }                     from '@/utils/cn'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import { useState }               from 'react'
 
export default function SessionReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate       = useNavigate()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
 
  const { data, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn:  () => interviewApi.getSessionDetail(sessionId!).then(r => r.data),
  })
 
  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    return next
  })
 
  if (isLoading) return <PageLoader />
  if (!data) return <div className="p-8 text-gray-400">Session not found</div>
 
  const { session, questionsAndAnswers: qa } = data
  const answered = qa.filter(q => q.answer)
  const avgScore  = answered.length
    ? answered.reduce((s, q) => s + (q.answer?.overallScore ?? 0), 0) / answered.length
    : 0
 
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Session Review"
        action={
          <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft size={14} /> Back
          </button>
        }
      />
 
      {/* Summary card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <ScoreCircle score={avgScore} size="lg" label="Overall" />
          <div className="flex-1 min-w-48">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{sessionTypeIcon[session.sessionType]}</span>
              <div>
                <p className="text-white font-semibold">{sessionTypeLabel[session.sessionType]}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('badge border text-xs', difficultyColor[session.difficulty])}>
                    {session.difficulty}
                  </span>
                  <Badge variant={session.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {session.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white">{answered.length}/{qa.length}</p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {session.completedAt
                    ? formatDuration(
                        Math.floor((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
                      )
                    : '-'}
                </p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{Math.round(avgScore)}</p>
                <p className="text-xs text-gray-500">Avg score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Q&A list */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Questions & Answers
      </h2>
      <div className="space-y-3">
        {qa.map(({ question, answer }, i) => (
          <div key={question.id} className="card overflow-hidden">
            <button
              onClick={() => toggle(question.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-raised/30 transition-colors"
            >
              <span className="text-xs text-brand-400 font-medium w-6 flex-shrink-0">Q{i + 1}</span>
              <p className="flex-1 text-sm text-white line-clamp-2">{question.questionText}</p>
              {answer && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ProgressBar value={answer.overallScore} className="w-20" />
                  <span className="text-sm font-bold" style={{
                    color: answer.overallScore >= 80 ? '#4ade80' : answer.overallScore >= 60 ? '#facc15' : '#f87171'
                  }}>
                    {Math.round(answer.overallScore)}
                  </span>
                </div>
              )}
              {!answer && <Badge variant="warning">Skipped</Badge>}
              <ChevronDown
                size={16}
                className={cn('text-gray-500 transition-transform flex-shrink-0', expanded.has(question.id) && 'rotate-180')}
              />
            </button>
 
            {expanded.has(question.id) && answer && (
              <div className="border-t border-surface-border p-5 space-y-4">
                {/* Score bars */}
                <div className="grid grid-cols-3 gap-3">
                  <ProgressBar value={answer.technicalScore}  label="Technical"   />
                  <ProgressBar value={answer.clarityScore}    label="Clarity"     />
                  <ProgressBar value={answer.confidenceScore} label="Confidence"  />
                </div>
                {/* Your answer */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your answer</p>
                  <p className="text-sm text-gray-300 bg-surface-raised rounded-xl p-3 border border-surface-border leading-relaxed">
                    {answer.answerId /* placeholder */ ? 'Answer recorded' : 'No transcript available'}
                  </p>
                </div>
                {/* AI feedback */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">AI Feedback</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{answer.feedbackText}</p>
                </div>
                {/* Strengths & Improvements */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-400 mb-2 font-medium">Strengths</p>
                    {answer.strengths.map((s, j) => (
                      <p key={j} className="text-xs text-gray-400">• {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 mb-2 font-medium">Improvements</p>
                    {answer.improvements.map((s, j) => (
                      <p key={j} className="text-xs text-gray-400">• {s}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
 
      <div className="mt-6 flex gap-3">
        <button onClick={() => navigate('/interview')} className="btn-primary flex-1">
          Start New Session
        </button>
        <button onClick={() => navigate('/analytics')} className="btn-ghost flex-1">
          View Analytics
        </button>
      </div>
    </div>
  )
}