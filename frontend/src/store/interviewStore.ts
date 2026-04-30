import { create } from 'zustand'
import type { InterviewSession, Question, AnswerFeedback } from '@/types'
 
interface InterviewState {
  activeSession:   InterviewSession | null
  currentQuestion: Question         | null
  lastFeedback:    AnswerFeedback    | null
  setSession:   (s: InterviewSession)  => void
  setQuestion:  (q: Question)          => void
  setFeedback:  (f: AnswerFeedback)    => void
  clearSession: ()                     => void
}
 
export const useInterviewStore = create<InterviewState>((set) => ({
  activeSession:   null,
  currentQuestion: null,
  lastFeedback:    null,
  setSession:  (activeSession)   => set({ activeSession }),
  setQuestion: (currentQuestion) => set({ currentQuestion }),
  setFeedback: (lastFeedback)    => set({ lastFeedback }),
  clearSession: ()               => set({ activeSession: null, currentQuestion: null, lastFeedback: null }),
}))