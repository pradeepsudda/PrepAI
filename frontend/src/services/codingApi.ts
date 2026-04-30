import api from './api'
import type { CodeExecutionResult, CodingChallenge, PagedResponse } from '@/types'

export const codingApi = {
  getChallenges: (page = 0, size = 10, difficulty?: string) =>
    api.get<PagedResponse<CodingChallenge>>('/coding/challenges', {
      params: { page, size, ...(difficulty ? { difficulty } : {}) },
    }),

  getChallengeById: (id: string) =>
    api.get<CodingChallenge>(`/coding/challenges/${id}`),

  runCode: (challengeId: string, language: string, sourceCode: string, input?: string) =>
    api.post<CodeExecutionResult>('/coding/run', { challengeId, language, sourceCode, input }),

  submitCode: (challengeId: string, language: string, sourceCode: string) =>
    api.post<CodeExecutionResult>('/coding/submit', { challengeId, language, sourceCode }),
}