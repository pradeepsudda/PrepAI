import { useEffect }                             from 'react'
import { useParams, useNavigate }                from 'react-router-dom'
import { Mic, MicOff, Send, SkipForward,
         Code2, MessageSquare }                  from 'lucide-react'
import { AIAvatar }                              from '@/components/interview/AIAvatar'
import { QuestionCard }                          from '@/components/interview/QuestionCard'
import { TranscriptBox }                         from '@/components/interview/TranscriptBox'
import { FeedbackPanel }                         from '@/components/interview/FeedbackPanel'
import { EvaluatingOverlay }                     from '@/components/interview/EvaluatingOverlay'
import { CodeAnswerPanel } from '@/components/interview/codeAnswerPanel'
import { LoadingSpinner }                        from '@/components/ui/LoadingSpinner'
import { useInterviewSession }                   from '@/hooks/useInterviewSession'
import { useSpeechRecognition }                  from '@/hooks/useSpeechRecognition'
import { useTextToSpeech }                       from '@/hooks/useTextToSpeech'
import { useCountdown }                          from '@/hooks/useCountdown'
import { cn }                                    from '@/utils/cn'
 
export default function HybridInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate       = useNavigate()
 
  const {
    phase, currentQuestion, lastFeedback, summary,
    fetchQuestion, startAnswering, submitAnswer, completeSession,
  } = useInterviewSession(sessionId!)
 
  const { speak, stop }       = useTextToSpeech()
  const { timeLeft, formatted, start: startTimer, reset: resetTimer } = useCountdown(
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
 
  const isCodeMode  = currentQuestion?.questionMode === 'CODE'
  const isVoiceMode = currentQuestion?.questionMode === 'VOICE' || !currentQuestion?.questionMode
 
  useEffect(() => { fetchQuestion() }, []) 
 
  useEffect(() => {
    if (currentQuestion && phase === 'question') {
      resetTimer()

      setTimeout(() => {
        startTimer()
      }, 0)

      if (isVoiceMode) {
        speak(currentQuestion.questionText)
      }
    }
  }, [currentQuestion?.id, phase])
 
  useEffect(() => {
    if (phase === 'completed' && summary) {
      navigate(`/sessions/${sessionId}`, { replace: true })
    }
  }, [phase, summary])
 
  const handleStartAnswering = () => {
    stop()           
    startAnswering() 
    if (isVoiceMode) startListening()
  }
 
  const handleVoiceSubmit = () => {
    stopListening()
    submitAnswer(transcript, getDurationSeconds())
  }
 
  const handleCodeSubmit = (code: string) => {
    submitAnswer(code, 0)
  }
 
  const handleSkip = () => {
    if (isListening) stopListening()
    submitAnswer('No answer provided.', 0)
  }
 
  const isLast = currentQuestion
    ? currentQuestion.currentNumber >= currentQuestion.totalQuestions
    : false
 
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-8 px-4">
 
      {/* ── Progress dots ── */}
      {currentQuestion && (
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i < currentQuestion.currentNumber - 1
                  ? 'w-8 bg-brand-500'
                  : i === currentQuestion.currentNumber - 1
                    ? 'w-8 bg-brand-400 animate-pulse'
                    : 'w-6 bg-surface-border',
              )}
            />
          ))}
        </div>
      )}
 
      {/* ── Mode badge ── */}
      {currentQuestion && (
        <div className={cn(
          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border mb-6',
          isCodeMode
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-brand-500/10 border-brand-500/30 text-brand-400',
        )}>
          {isCodeMode
            ? <><Code2 size={12} /> Coding Question</>
            : <><MessageSquare size={12} /> Verbal Question</>}
        </div>
      )}
 
      {/* ── AI Avatar — shown for voice mode, hidden for code ── */}
      {isVoiceMode && (
        <AIAvatar isSpeaking={phase === 'question' && isVoiceMode} isListening={isListening} />
      )}
 
      <div className={cn(
        'flex flex-col items-center gap-5 w-full mt-6',
        isCodeMode ? 'max-w-4xl' : 'max-w-2xl',
      )}>
 
        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm">Generating question…</p>
          </div>
        )}
 
        {/* Question card — shown in question/answering/coding phases */}
        {(phase === 'question' || phase === 'answering' || phase === 'coding') && currentQuestion && (
          <>
            <QuestionCard
              questionText={currentQuestion.questionText}
              currentNumber={currentQuestion.currentNumber}
              totalQuestions={currentQuestion.totalQuestions}
              timeLimitSec={currentQuestion.timeLimitSec}
              timeLeft={timeLeft}
              // Only show speak button for VOICE questions
              onSpeak={isVoiceMode ? () => speak(currentQuestion.questionText) : undefined}
            />
 
            {/* ── VOICE answering UI ── */}
            {phase === 'question' && isVoiceMode && (
              <button onClick={handleStartAnswering} className="btn-primary flex items-center gap-2">
                <Mic size={16} /> Start Answering
              </button>
            )}
 
            {phase === 'answering' && isVoiceMode && (
              <>
                <TranscriptBox
                  transcript={transcript}
                  isListening={isListening}
                  error={!isSupported
                    ? 'Speech recognition not supported. Use Chrome or Edge.'
                    : error}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      'p-4 rounded-full transition-all shadow-lg',
                      isListening
                        ? 'bg-green-600 hover:bg-green-500 shadow-green-600/30' 
                        : 'bg-red-600 hover:bg-red-500 shadow-red-600/30',
                    )}
                  >
                    {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button
                    onClick={handleVoiceSubmit}
                    disabled={transcript.trim().length < 10}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40"
                  >
                    <Send size={16} /> Submit
                  </button>
                  <button
                    onClick={handleSkip}
                    className="btn-ghost flex items-center gap-1.5 text-sm"
                  >
                    <SkipForward size={14} /> Skip
                  </button>
                </div>
                {isListening && confidence > 0 && (
                  <p className="text-xs text-gray-500">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </>
            )}
 
            {/* ── CODE mode: show editor immediately on question phase ── */}
            {isCodeMode && phase === 'question' && (
              <div className="w-full">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Read the question above, then write your solution below.
                </p>
                <CodeAnswerPanel
                  suggestedLanguage={currentQuestion.suggestedLanguage}
                  onSubmit={handleCodeSubmit}
                  onSkip={handleSkip}
                  disabled={false}
                />
              </div>
            )}
 
            {/* ── CODE mode: coding phase (after "Start Coding") ── */}
            {isCodeMode && phase === 'coding' && (
              <CodeAnswerPanel
                suggestedLanguage={currentQuestion.suggestedLanguage}
                onSubmit={handleCodeSubmit}
                onSkip={handleSkip}
                disabled={false}
              />
            )}
          </>
        )}
 
        {/* Evaluating overlay */}
        {phase === 'evaluating' && <EvaluatingOverlay />}
 
        {/* Feedback panel */}
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
 