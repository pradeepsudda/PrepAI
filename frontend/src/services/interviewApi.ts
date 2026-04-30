import api from './api'
import type {
  InterviewSession, Question, AnswerFeedback,
  SessionSummary, SessionDetail, CreateSessionRequest
} from '@/types'
 
export const interviewApi = {
  createSession: (data: CreateSessionRequest) =>
    api.post<InterviewSession>('/interviews/sessions', data),
 
  getSessions: () =>
    api.get<InterviewSession[]>('/interviews/sessions'),
 
  getSessionDetail: (sessionId: string) =>
    api.get<SessionDetail>(`/interviews/sessions/${sessionId}`),
 
  getNextQuestion: (sessionId: string) =>
    api.get<Question>(`/interviews/sessions/${sessionId}/next-question`),
 
  submitAnswer: (sessionId: string, questionId: string, answerText: string, audioDuration?: number) =>
    api.post<AnswerFeedback>(`/interviews/sessions/${sessionId}/answers`, {
      questionId, answerText, audioDuration,
    }),
 
  completeSession: (sessionId: string) =>
    api.post<SessionSummary>(`/interviews/sessions/${sessionId}/complete`),
 
  abandonSession: (sessionId: string) =>
    api.patch(`/interviews/sessions/${sessionId}/abandon`),
}