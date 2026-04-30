import { useNavigate }      from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { Badge }              from '@/components/ui/Badge'
import { cn }                 from '@/utils/cn'
import { formatRelative, scoreBg, difficultyColor, sessionTypeIcon, sessionTypeLabel } from '@/utils/format'
import type { InterviewSession } from '@/types'
 
interface Props { session: InterviewSession }
 
export function SessionCard({ session }: Props) {
  const navigate = useNavigate()
 
  const statusVariant = {
    COMPLETED:   'success',
    IN_PROGRESS: 'warning',
    ABANDONED:   'danger',
  }[session.status] as 'success' | 'warning' | 'danger'
 
  return (
    <div
      className="card p-5 hover:border-surface-raised cursor-pointer
                 transition-all duration-200 hover:bg-surface-raised/30"
      onClick={() => navigate(`/sessions/${session.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sessionTypeIcon[session.sessionType]}</span>
          <div>
            <p className="text-sm font-medium text-white">
              {sessionTypeLabel[session.sessionType]}
            </p>
            {session.topic && (
              <p className="text-xs text-gray-500 mt-0.5">{session.topic}</p>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-600 mt-0.5" />
      </div>
 
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={statusVariant}>{session.status.replace('_', ' ')}</Badge>
        <span className={cn('badge border text-xs', difficultyColor[session.difficulty])}>
          {session.difficulty}
        </span>
        {session.overallScore != null && (
          <span className={cn('badge border text-xs', scoreBg(session.overallScore))}>
            {Math.round(session.overallScore)}/100
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
          <Clock size={11} />
          {formatRelative(session.startedAt)}
        </span>
      </div>
    </div>
  )
}