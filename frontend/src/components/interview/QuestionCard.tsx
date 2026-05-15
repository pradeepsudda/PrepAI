import { Volume2 } from 'lucide-react'
import { cn } from '@/utils/cn'
 
interface Props {
  questionText:   string
  currentNumber:  number
  totalQuestions: number
  timeLimitSec:   number
  timeLeft:       number
  onSpeak?: () => void 
}

 
export function QuestionCard({
  questionText, currentNumber, totalQuestions, timeLimitSec, timeLeft, onSpeak
}: Props) {
  const pct   = (timeLeft / timeLimitSec) * 100
  const color = pct > 50 ? 'bg-brand-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
 
  return (
    <div className="card p-6 w-full max-w-2xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">
            Question {currentNumber} of {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <span className={cn(
            'text-sm font-mono font-medium',
            pct > 50 ? 'text-gray-400' : pct > 20 ? 'text-yellow-400' : 'text-red-400',
          )}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </span>
          {onSpeak && <button
            onClick={onSpeak}
            className="p-2 rounded-lg hover:bg-surface-raised text-gray-400
                       hover:text-brand-400 transition-colors"
            title="Read question aloud"
          >
            <Volume2 size={16} />
          </button>
          }
        </div>
      </div>
 
      {/* Timer bar */}
      <div className="h-1 bg-surface-border rounded-full mb-5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
 
      {/* Question text */}
      <p className="text-white text-base leading-relaxed">{questionText}</p>
    </div>
  )
}