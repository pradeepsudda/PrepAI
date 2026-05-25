import { useEffect } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import { Mic, MicOff, Send, SkipForward } from 'lucide-react'
import { AIAvatar }          from '@/components/interview/AIAvatar'
import { QuestionCard }      from '@/components/interview/QuestionCard'
import { TranscriptBox }     from '@/components/interview/TranscriptBox'
import { FeedbackPanel }     from '@/components/interview/FeedbackPanel'
import { EvaluatingOverlay } from '@/components/interview/EvaluatingOverlay'
import { LoadingSpinner }    from '@/components/ui/LoadingSpinner'
import { useInterviewSession } from '@/hooks/useInterviewSession'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTextToSpeech }   from '@/hooks/useTextToSpeech'
import { useCountdown }      from '@/hooks/useCountdown'
 
export default function VoiceInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate       = useNavigate()
 
  const {
    phase, currentQuestion, lastFeedback, summary,
    fetchQuestion, startAnswering, submitAnswer, completeSession,
  } = useInterviewSession(sessionId!)
 
  const { speak, stop }                                         = useTextToSpeech()
  const { timeLeft, start: startTimer, reset: resetTimer } = useCountdown(
    currentQuestion?.timeLimitSec ?? 300
  )
 
  const {
    transcript, isListening, confidence, error, isSupported,
    startListening, stopListening, getDurationSeconds,
  } = useSpeechRecognition({
    onSilenceDetected: () => {
      if (transcript.length > 50) stopListening()
    },
  })
 
  useEffect(() => { fetchQuestion() }, [])
 
  useEffect(() => {
    if (currentQuestion && phase === 'question') {
      speak(currentQuestion.questionText)
      resetTimer()
      startTimer()
    }
  }, [currentQuestion?.id])
 
  const handleStartAnswer = () => {
    stop()
    startAnswering()
    startListening()
  }
 
  const handleSubmit = () => {
    stopListening()
    submitAnswer(transcript, getDurationSeconds())
  }
 
  const handleSkip = () => {
    submitAnswer('No answer provided.', 0)
  }
 
  const isLast = currentQuestion
    ? currentQuestion.currentNumber >= currentQuestion.totalQuestions
    : false
 
  if (phase === 'completed' && summary) {
    navigate(`/sessions/${sessionId}`, { replace: true })
    return null
  }
 
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-10 px-4">
      {/* Progress indicator */}
      {currentQuestion && (
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
            <div key={i} className={`h-1 w-8 rounded-full transition-all ${
              i < currentQuestion.currentNumber - 1 ? 'bg-brand-500' :
              i === currentQuestion.currentNumber - 1 ? 'bg-brand-400 animate-pulse-slow' :
              'bg-surface-border'
            }`} />
          ))}
        </div>
      )}
 
      <AIAvatar isSpeaking={phase === 'question'} isListening={isListening} />
 
      <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-2xl mt-8">
 
        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm">Generating question…</p>
          </div>
        )}
 
        {/* Question phase */}
        {(phase === 'question' || phase === 'answering') && currentQuestion && (
          <>
            <QuestionCard
              questionText={currentQuestion.questionText}
              currentNumber={currentQuestion.currentNumber}
              totalQuestions={currentQuestion.totalQuestions}
              timeLimitSec={currentQuestion.timeLimitSec}
              timeLeft={timeLeft}
              onSpeak={() => speak(currentQuestion.questionText)}
            />
 
            {phase === 'answering' && (
              <TranscriptBox
                transcript={transcript}
                isListening={isListening}
                error={!isSupported ? 'Speech recognition not supported. Type your answer.' : error}
              />
            )}
 
            {/* Controls */}
            <div className="flex items-center gap-3 mt-2">
              {phase === 'question' && (
                <button onClick={handleStartAnswer} className="btn-primary flex items-center gap-2">
                  <Mic size={16} /> Start Answering
                </button>
              )}
 
              {phase === 'answering' && (
                <>
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-4 rounded-full transition-all ${
                      isListening
                        ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30'
                        : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30'
                    }`}
                  >
                    {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
 
                  <button
                    onClick={handleSubmit}
                    disabled={transcript.trim().length < 10}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40"
                  >
                    <Send size={16} /> Submit
                  </button>
 
                  <button
                    onClick={handleSkip}
                    className="btn-ghost flex items-center gap-1.5 text-sm"
                    title="Skip this question"
                  >
                    <SkipForward size={14} /> Skip
                  </button>
                </>
              )}
            </div>
 
            {/* Confidence indicator */}
            {isListening && confidence > 0 && (
              <p className="text-xs text-gray-500">
                Recognition confidence: {Math.round(confidence * 100)}%
              </p>
            )}
          </>
        )}
 
        {/* Evaluating */}
        {phase === 'evaluating' && <EvaluatingOverlay />}
 
        {/* Feedback */}
        {phase === 'feedback' && lastFeedback && (
          <FeedbackPanel
            feedback={lastFeedback}
            isLast={isLast}
            onNext={fetchQuestion}
            onComplete={completeSession}
          />
        )}
      </div>
    </div>
  )
}
