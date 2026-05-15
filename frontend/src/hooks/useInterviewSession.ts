import { useState, useCallback, useRef } from 'react'
import { useMutation }                    from '@tanstack/react-query'
import { interviewApi }                   from '@/services/interviewApi'
import { useInterviewStore }              from '@/store/interviewStore'
import type { AnswerFeedback, SessionSummary } from '@/types'
import toast from 'react-hot-toast'

export type Phase =
  | 'loading' | 'question' | 'answering'
  | 'coding'  | 'evaluating' | 'feedback' | 'completed'

export function useInterviewSession(sessionId: string) {
  const [phase,   setPhase]   = useState<Phase>('loading')
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const { setQuestion, setFeedback, currentQuestion, lastFeedback } = useInterviewStore()

  const isFetchingRef = useRef(false)

  const fetchQuestionMutation = useMutation({
    mutationFn: () => interviewApi.getNextQuestion(sessionId),
    onSuccess: (res) => {
      isFetchingRef.current = false  
      setQuestion(res.data)
      setPhase('question')
    },
    onError: (err: unknown) => {
      isFetchingRef.current = false  
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to fetch question'
      if (msg.includes('All') || msg.includes('completed')) {
        handleComplete()
      } else {
        toast.error(msg)
      }
    },
  })

  const submitAnswerMutation = useMutation({
    mutationFn: ({
      answerText,
      audioDuration,
    }: {
      answerText:     string
      audioDuration?: number
    }) =>
      interviewApi.submitAnswer(
        sessionId,
        currentQuestion!.id,
        answerText,
        audioDuration
      ),
    onMutate:  () => setPhase('evaluating'),
    onSuccess: (res) => { setFeedback(res.data); setPhase('feedback') },
    onError:   () => {
      toast.error('Failed to evaluate answer')
      setPhase(currentQuestion?.questionMode === 'CODE' ? 'coding' : 'answering')
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => interviewApi.completeSession(sessionId),
    onSuccess:  (res) => { setSummary(res.data); setPhase('completed') },
    onError:    () => toast.error('Failed to complete session'),
  })

  const handleNextQuestion = useCallback(() => {
    if (isFetchingRef.current) {
      console.warn('fetchQuestion called while already in-flight — ignoring duplicate')
      return
    }
    isFetchingRef.current = true
    setPhase('loading')
    fetchQuestionMutation.mutate()
  }, [fetchQuestionMutation])

  const handleComplete = useCallback(() => {
    completeMutation.mutate()
  }, [completeMutation])

  const handleStartAnswering = useCallback(() => {
    if (currentQuestion?.questionMode === 'CODE') {
      setPhase('coding')
    } else {
      setPhase('answering')
    }
  }, [currentQuestion])

  return {
    phase,
    currentQuestion,
    lastFeedback:    lastFeedback as AnswerFeedback | null,
    summary,
    fetchQuestion:   handleNextQuestion,
    startAnswering:  handleStartAnswering,
    submitAnswer:    (text: string, duration?: number) =>
      submitAnswerMutation.mutate({ answerText: text, audioDuration: duration }),
    completeSession: handleComplete,
    isEvaluating:    submitAnswerMutation.isPending,
  }
}