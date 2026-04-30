import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '@/services/interviewApi'
import { useInterviewStore } from '@/store/interviewStore'
import type { AnswerFeedback, SessionSummary } from '@/types'
import toast from 'react-hot-toast'
 
type Phase = 'loading' | 'question' | 'answering' | 'evaluating' | 'feedback' | 'completed'
 
export function useInterviewSession(sessionId: string) {
  const [phase, setPhase]       = useState<Phase>('loading')
  const [summary, setSummary]   = useState<SessionSummary | null>(null)
  const { setQuestion, setFeedback, currentQuestion, lastFeedback } = useInterviewStore()
 
  const fetchQuestion = useMutation({
    mutationFn: () => interviewApi.getNextQuestion(sessionId),
    onSuccess:  (res) => { setQuestion(res.data); setPhase('question') },
    onError:    (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to fetch question'
      // Session completed — all questions asked
      if (msg.includes('All') || msg.includes('completed')) {
        handleComplete()
      } else {
        toast.error(msg)
      }
    },
  })
 
  const submitAnswer = useMutation({
    mutationFn: ({ answerText, audioDuration }: { answerText: string; audioDuration?: number }) =>
      interviewApi.submitAnswer(sessionId, currentQuestion!.id, answerText, audioDuration),
    onMutate:   () => setPhase('evaluating'),
    onSuccess:  (res) => { setFeedback(res.data); setPhase('feedback') },
    onError:    () => { toast.error('Failed to evaluate answer'); setPhase('answering') },
  })
 
  const completeMutation = useMutation({
    mutationFn: () => interviewApi.completeSession(sessionId),
    onSuccess:  (res) => { setSummary(res.data); setPhase('completed') },
    onError:    () => toast.error('Failed to complete session'),
  })
 
  const handleNextQuestion = useCallback(() => {
    setPhase('loading')
    fetchQuestion.mutate()
  }, [fetchQuestion])
 
  const handleComplete = useCallback(() => {
    completeMutation.mutate()
  }, [completeMutation])
 
  const handleStartAnswering = useCallback(() => setPhase('answering'), [])
 
  return {
    phase,
    currentQuestion,
    lastFeedback: lastFeedback as AnswerFeedback | null,
    summary,
    fetchQuestion: handleNextQuestion,
    startAnswering: handleStartAnswering,
    submitAnswer:   (text: string, duration?: number) =>
      submitAnswer.mutate({ answerText: text, audioDuration: duration }),
    completeSession: handleComplete,
    isEvaluating: submitAnswer.isPending,
  }
}