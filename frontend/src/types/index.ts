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
  id:                string
  questionText:      string
  questionType:      string
  orderIndex:        number
  timeLimitSec:      number
  currentNumber:     number
  totalQuestions:    number
  questionMode:      'VOICE' | 'CODE'   // ✅ NEW — drives UI switching
  suggestedLanguage?: string            // ✅ NEW — "python", "java", etc.
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
  timestamp: number
}

export interface RoomEvent {
  type:      string
  userId:    string
  timestamp: number
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

// Type for WebRTC signals received from server
export interface WebRtcSignalMsg {
  type:    string   // OFFER | ANSWER | ICE_CANDIDATE
  from:    string   // sender email
  to:      string   // receiver email
  payload: string   // JSON string of SDP or ICE candidate
}

export type CodeLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'typescript'

export interface ProfileStats {
  totalSessions:          number
  completedSessions:      number
  abandonedSessions:      number
  avgScore:               number
  bestScore:              number
  totalQuestionsAnswered: number
  totalPracticeMinutes:   number
  currentStreak:          number
  longestStreak:          number
  strongestCategory:      string
  weakestCategory:        string
  dsaSessions:            number
  systemDesignSessions:   number
  behavioralSessions:     number
  mixedSessions:          number
}

export interface ProfileData {
  id:                  string
  email:               string
  fullName:            string
  role:                string
  bio?:                string
  location?:           string
  createdAt:           string
  githubUrl?:          string
  linkedinUrl?:        string
  leetcodeUrl?:        string
  hackerrankUrl?:      string
  codeforcesUrl?:      string
  websiteUrl?:         string
  defaultDifficulty:   string
  preferredLanguage:   string
  emailNotifications:  boolean
  stats:               ProfileStats
}

export interface UpdateProfilePayload {
  fullName?:           string
  email?:              string
  bio?:                string
  location?:           string
  githubUrl?:          string
  linkedinUrl?:        string
  leetcodeUrl?:        string
  hackerrankUrl?:      string
  codeforcesUrl?:      string
  websiteUrl?:         string
  defaultDifficulty?:  string
  preferredLanguage?:  string
  emailNotifications?: boolean
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword:     string
}

export type ResourceType =
  | 'VIDEO' | 'ARTICLE' | 'COURSE' | 'BOOK'
  | 'PRACTICE' | 'DOCUMENTATION' | 'REPO'
  | 'GITHUB' | 'ROADMAP' 

export type ResourceDifficulty =
  | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  | 'ALL'   

export interface ResourceItem {
  title: string
  description: string
  type: ResourceType
  difficulty: ResourceDifficulty
  estimatedTime: string
  url: string
  platform: string
  topics: string[]
  whyRecommended: string
  isPriority: boolean

  source?: string
  whyRelevant?: string
  priority?: number
}

export interface ResourceSection {
  sectionTitle: string
  sectionDescription: string
  priority: number
  resources: ResourceItem[]

  category?: string
  focusArea?: string
  weaknessSummary?: string
  studyPlan?: string[]
  userScore?: number
}

export interface ResourcesResponse {
  personalizedSummary: string
  studyPlan: string
  estimatedPrepTime: string
  sections: ResourceSection[]
  quickWins: string[]

  overallAdvice?: string
  priorityActions?: string[]
  generatedAt?: string
  fromCache?: boolean
}