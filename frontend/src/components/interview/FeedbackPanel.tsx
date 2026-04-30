import { CheckCircle, TrendingUp, Lightbulb, ChevronRight } from 'lucide-react'
import { ScoreCircle } from '@/components/ui/ScoreCircle'
import { ProgressBar }  from '@/components/ui/ProgressBar'
import type { AnswerFeedback } from '@/types'
 
interface Props {
  feedback:    AnswerFeedback
  onNext:      () => void
  onComplete?: () => void
  isLast:      boolean
}
 
export function FeedbackPanel({ feedback, onNext, onComplete, isLast }: Props) {
  return (
    <div className="card p-6 w-full max-w-2xl animate-slide-up">
      {/* Scores row */}
      <div className="flex items-center justify-around mb-6 pb-6 border-b border-surface-border">
        <ScoreCircle score={feedback.technicalScore}  size="md" label="Technical"   />
        <ScoreCircle score={feedback.clarityScore}    size="lg" label="Overall"     />
        <ScoreCircle score={feedback.confidenceScore} size="md" label="Confidence"  />
      </div>
 
      {/* Score bars */}
      <div className="space-y-3 mb-6">
        <ProgressBar value={feedback.technicalScore}  label="Technical accuracy" />
        <ProgressBar value={feedback.clarityScore}    label="Communication clarity" />
        <ProgressBar value={feedback.confidenceScore} label="Confidence" />
      </div>
 
      {/* Feedback text */}
      <div className="bg-surface-raised rounded-xl p-4 mb-5 border border-surface-border">
        <p className="text-sm text-gray-300 leading-relaxed">{feedback.feedbackText}</p>
      </div>
 
      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="flex items-center gap-1.5 text-green-400 text-xs font-semibold
                         uppercase tracking-wider mb-2">
            <CheckCircle size={12} /> Strengths
          </h4>
          <ul className="space-y-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-gray-400 text-xs flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold
                         uppercase tracking-wider mb-2">
            <TrendingUp size={12} /> Improve
          </h4>
          <ul className="space-y-1.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="text-gray-400 text-xs flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
 
      {/* Model answer */}
      {feedback.modelAnswer && (
        <details className="mb-5">
          <summary className="flex items-center gap-1.5 text-xs text-gray-400
                              hover:text-white cursor-pointer select-none">
            <Lightbulb size={12} />
            View ideal answer outline
          </summary>
          <div className="mt-2 bg-surface-raised rounded-xl p-4 border border-surface-border">
            <p className="text-xs text-gray-300 leading-relaxed">{feedback.modelAnswer}</p>
          </div>
        </details>
      )}
 
      {/* Actions */}
      <div className="flex gap-3">
        {isLast ? (
          <button onClick={onComplete} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Complete Session
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Next Question <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}