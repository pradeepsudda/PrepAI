export type SessionType  = 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'MIXED'
export type Difficulty   = 'EASY' | 'MEDIUM' | 'HARD'
export type SessionStatus= 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
 
export interface User {
  id:       string
  email:    string
  fullName: string
  role:     string
}
 
export interface AuthResponse {
  token: string
  user:  User
}
 
export interface InterviewSession {
  id:             string
  sessionType:    SessionType
  difficulty:     Difficulty
  topic?:         string
  status:         SessionStatus
  totalQuestions: number
  startedAt:      string
  completedAt?:   string
  overallScore?:  number
}
 
export interface Question {
  id:             string
  questionText:   string
  questionType:   string
  orderIndex:     number
  timeLimitSec:   number
  currentNumber:  number
  totalQuestions: number
}
 
export interface AnswerFeedback {
  answerId:        string
  technicalScore:  number
  clarityScore:    number
  confidenceScore: number
  overallScore:    number
  feedbackText:    string
  strengths:       string[]
  improvements:    string[]
  modelAnswer?:    string
}
 
export interface SessionSummary {
  sessionId:              string
  overallScore:           number
  avgTechnicalScore:      number
  avgClarityScore:        number
  avgConfidenceScore:     number
  totalQuestionsAnswered: number
  durationMinutes:        number
  topStrengths:           string[]
  topImprovements:        string[]
  completedAt:            string
}
 
export interface QuestionWithAnswer {
  question: Question
  answer?:  AnswerFeedback
}
 
export interface SessionDetail {
  session:             InterviewSession
  questionsAndAnswers: QuestionWithAnswer[]
}
 
export interface ScorePoint {
  date:  string
  score: number
}
 
export interface AnalyticsDashboard {
  totalSessionsAllTime:    number
  totalSessionsLast30Days: number
  avgScore:                number
  completionRatePercent:   number
  scoreTrend:              ScorePoint[]
  categoryScores:          Record<string, number>
  strongTopics:            string[]
  weakTopics:              string[]
}
 
export interface ResumeProfile {
  skills:          string[]
  experienceYears: number
  seniorityLevel:  string
  companies:       string[]
  roles:           string[]
  techStack:       string[]
  focusAreas:      string[]
}
 
export interface CreateSessionRequest {
  sessionType: SessionType
  difficulty:  Difficulty
  topic?:      string
  context?:    string
}
 
export interface CodeExecutionResult {
  status:           string
  stdout?:          string
  stderr?:          string
  compileOutput?:   string
  runtimeMs?:       number
  memoryKb?:        number
  passedTests:      number
  totalTests:       number
  testCaseResults?: TestCaseResult[]
}
 
export interface TestCaseResult {
  testCaseIndex:   number
  passed:          boolean
  /** "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" */
  errorStatus?:    string
  input:           string
  expectedOutput:  string
  actualOutput:    string
  stderr?:         string
  compileOutput?:  string
  runtimeMs?:      number
}
 
export interface RoomDto {
  id:               string
  roomCode:         string
  hostId:           string
  participantCount: number
  active:           boolean
  createdAt:        string
}
 
export interface ChatMessage {
  text:      string
  sender:    string
  timestamp: string
}

export interface CodingChallenge {
  id:           string
  title:        string
  description:  string
  difficulty:   'EASY' | 'MEDIUM' | 'HARD'
  constraints:  string[]
  examples:     { input: string; output: string; explanation?: string }[]
  starterCode:  Record<string, string>
  timeLimitSec: number
}

export interface PagedResponse<T> {
  content:       T[]
  totalElements: number
  totalPages:    number
  number:        number   // current page (0-based)
  size:          number
  first:         boolean
  last:          boolean
}