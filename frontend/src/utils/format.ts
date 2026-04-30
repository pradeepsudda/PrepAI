import { formatDistanceToNow, format } from 'date-fns'
 
export const formatRelative = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true })
 
export const formatDate = (date: string) =>
  format(new Date(date), 'dd MMM yyyy')
 
export const formatDuration = (minutes: number): string => {
  if (minutes < 1)  return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
 
export const scoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}
 
export const scoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-500/10 text-green-400 border-green-500/20'
  if (score >= 60) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}
 
export const difficultyColor: Record<string, string> = {
  EASY:   'bg-green-500/10 text-green-400 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HARD:   'bg-red-500/10 text-red-400 border-red-500/20',
}
 
export const sessionTypeLabel: Record<string, string> = {
  DSA:           'Data Structures & Algorithms',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL:    'Behavioral',
  MIXED:         'Mixed',
}
 
export const sessionTypeIcon: Record<string, string> = {
  DSA:           '🧩',
  SYSTEM_DESIGN: '🏗️',
  BEHAVIORAL:    '🗣️',
  MIXED:         '⚡',
}
 