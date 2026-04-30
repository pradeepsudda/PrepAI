import api from './api'
import type { ResumeProfile, CreateSessionRequest, SessionType } from '@/types'
 
export const resumeApi = {
  parseResume: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ResumeProfile>('/resume/parse', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
 
  personalise: (profile: ResumeProfile, sessionType: SessionType) =>
    api.post<CreateSessionRequest>(`/resume/personalise?sessionType=${sessionType}`, profile),
}