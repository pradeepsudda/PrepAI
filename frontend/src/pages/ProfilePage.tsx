import { useState }                          from 'react'
import { useQuery, useMutation,
         useQueryClient }                    from '@tanstack/react-query'
import { useForm }                           from 'react-hook-form'
import { zodResolver }                       from '@hookform/resolvers/zod'
import { z }                                 from 'zod'
import { useNavigate }                       from 'react-router-dom'
import {
  User, Mail, MapPin, Link, Github, Linkedin,
  Code2, Lock, Trash2, Save, Edit3, ExternalLink,
  Trophy, Target, Flame, Clock, CheckCircle2,
  BarChart3, Shield, Bell, Zap, ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { profileApi }    from '@/services/profileApi'
import { useAuthStore }  from '@/store/authStore'
import { PageHeader }    from '@/components/ui/PageHeader'
import { Badge }         from '@/components/ui/Badge'
import { Modal }         from '@/components/ui/Modal'
import { cn }            from '@/utils/cn'
import { formatDate }    from '@/utils/format'
import toast             from 'react-hot-toast'
import type { UpdateProfilePayload } from '@/types'
 
// ── Tabs ──────────────────────────────────────────────────────
type Tab = 'overview' | 'edit' | 'platforms' | 'preferences' | 'security'
 
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',    icon: <BarChart3 size={15} />   },
  { id: 'edit',        label: 'Edit Profile',icon: <Edit3 size={15} />       },
  { id: 'platforms',   label: 'Platforms',   icon: <Link size={15} />        },
  { id: 'preferences', label: 'Preferences', icon: <Zap size={15} />        },
  { id: 'security',    label: 'Security',    icon: <Shield size={15} />      },
]
 
// ── Schemas ───────────────────────────────────────────────────
const editSchema = z.object({
  fullName: z.string().min(2).max(100),
  email:    z.string().email(),
  bio:      z.string().max(300).optional(),
  location: z.string().max(100).optional(),
})
 
const platformSchema = z.object({
  githubUrl:      z.string().url().optional().or(z.literal('')),
  linkedinUrl:    z.string().url().optional().or(z.literal('')),
  leetcodeUrl:    z.string().url().optional().or(z.literal('')),
  hackerrankUrl:  z.string().url().optional().or(z.literal('')),
  codeforcesUrl:  z.string().url().optional().or(z.literal('')),
  websiteUrl:     z.string().url().optional().or(z.literal('')),
})
 
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
})
 
// ── Helpers ───────────────────────────────────────────────────
const fmtMinutes = (mins: number) => {
  if (mins < 60)   return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
 
const scoreColor = (s: number) =>
  s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'
 
// ── Main Component ────────────────────────────────────────────
export default function ProfilePage() {
  const [tab,            setTab]            = useState<Tab>('overview')
  const [deleteModalOpen, setDeleteModal]   = useState(false)
  const [deletePassword,  setDeletePassword] = useState('')
  const { updateUser, logout }              = useAuthStore()
  const navigate                            = useNavigate()
  const qc                                  = useQueryClient()
 
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => profileApi.getProfile().then(r => r.data),
  })
 
  const updateMutation = useMutation({
    mutationFn:  (d: UpdateProfilePayload) => profileApi.updateProfile(d),
    onSuccess:   (res) => {
      qc.setQueryData(['profile'], res.data)
      // Sync name/email in auth store so sidebar updates immediately
      updateUser({ ...useAuthStore.getState().user!, fullName: res.data.fullName, email: res.data.email })
      toast.success('Profile updated!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to update profile'
      toast.error(msg)
    },
  })
 
  const deleteMutation = useMutation({
    mutationFn:  () => profileApi.deleteAccount(deletePassword),
    onSuccess:   () => { logout(); navigate('/login', { replace: true }) },
    onError:     () => toast.error('Incorrect password'),
  })
 
  if (isLoading || !profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-surface-card rounded-2xl" />
          <div className="h-64 bg-surface-card rounded-2xl" />
        </div>
      </div>
    )
  }
 
  const { stats } = profile
 
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader title="Profile" subtitle="Manage your account and track your progress" />
 
      {/* ── Profile header card ── */}
      <div className="card p-6 mb-6 flex items-start gap-5 flex-wrap">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900
                        flex items-center justify-center text-3xl font-bold text-white
                        border-2 border-brand-500/30 flex-shrink-0 shadow-lg shadow-brand-600/20">
          {profile.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
 
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="font-display text-xl font-bold text-white">{profile.fullName}</h2>
            <Badge variant={profile.role === 'ADMIN' ? 'danger' : 'info'}>
              {profile.role}
            </Badge>
          </div>
 
          <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> {profile.email}
            </span>
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> Member since {formatDate(profile.createdAt)}
            </span>
          </div>
 
          {profile.bio && (
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{profile.bio}</p>
          )}
 
          {/* Platform quick links */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white
                           bg-surface-raised border border-surface-border px-2.5 py-1 rounded-lg transition-colors">
                <Github size={12} /> GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white
                           bg-surface-raised border border-surface-border px-2.5 py-1 rounded-lg transition-colors">
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {profile.leetcodeUrl && (
              <a href={profile.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white
                           bg-surface-raised border border-surface-border px-2.5 py-1 rounded-lg transition-colors">
                <Code2 size={12} /> LeetCode
              </a>
            )}
          </div>
        </div>
 
        {/* Streak badge */}
        {stats.currentStreak > 0 && (
          <div className="flex flex-col items-center gap-1 bg-amber-500/10 border border-amber-500/20
                          rounded-2xl px-4 py-3 flex-shrink-0">
            <Flame size={20} className="text-amber-400" />
            <span className="text-lg font-bold text-amber-400">{stats.currentStreak}</span>
            <span className="text-xs text-gray-500">day streak</span>
          </div>
        )}
      </div>
 
      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-raised',
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
 
      {/* ── Tab content ── */}
      {tab === 'overview'    && <OverviewTab   stats={stats} profile={profile} />}
      {tab === 'edit'        && <EditTab       profile={profile} onSave={(d) => updateMutation.mutate(d)} saving={updateMutation.isPending} />}
      {tab === 'platforms'   && <PlatformsTab  profile={profile} onSave={(d) => updateMutation.mutate(d)} saving={updateMutation.isPending} />}
      {tab === 'preferences' && <PreferencesTab profile={profile} onSave={(d) => updateMutation.mutate(d)} saving={updateMutation.isPending} />}
      {tab === 'security'    && (
        <SecurityTab onDeleteRequest={() => setDeleteModal(true)} />
      )}
 
      {/* ── Delete account modal ── */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">
              This action is permanent. All your sessions, answers, and progress will be deleted.
              This cannot be undone.
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Your current password"
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={!deletePassword || deleteMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white
                         font-medium py-2.5 rounded-xl transition-colors flex items-center
                         justify-center gap-2"
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
 
// ════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════════
function OverviewTab({ stats, profile }: { stats: any; profile: any }) {
  const KPI = [
    { label: 'Total Sessions',    value: stats.totalSessions,          icon: <Target size={16} />,   color: 'text-brand-400'  },
    { label: 'Avg Score',         value: `${stats.avgScore}%`,         icon: <BarChart3 size={16} />, color: scoreColor(stats.avgScore) },
    { label: 'Best Score',        value: `${stats.bestScore}%`,        icon: <Trophy size={16} />,   color: 'text-amber-400'  },
    { label: 'Questions Done',    value: stats.totalQuestionsAnswered, icon: <CheckCircle2 size={16} />, color: 'text-green-400' },
    { label: 'Practice Time',     value: fmtMinutes(stats.totalPracticeMinutes), icon: <Clock size={16} />, color: 'text-purple-400' },
    { label: 'Longest Streak',    value: `${stats.longestStreak}d`,    icon: <Flame size={16} />,    color: 'text-orange-400' },
  ]
 
  const CATEGORIES = [
    { label: 'DSA',           value: stats.dsaSessions,          color: 'bg-blue-500' },
    { label: 'System Design', value: stats.systemDesignSessions, color: 'bg-purple-500' },
    { label: 'Behavioral',    value: stats.behavioralSessions,   color: 'bg-green-500' },
    { label: 'Mixed',         value: stats.mixedSessions,        color: 'bg-amber-500' },
  ]
 
  const totalCat = stats.dsaSessions + stats.systemDesignSessions +
                   stats.behavioralSessions + stats.mixedSessions || 1
 
  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {KPI.map(k => (
          <div key={k.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn('text-2xl font-bold font-display', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>
 
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Session breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Session Breakdown</h3>
          <div className="space-y-3">
            {CATEGORIES.map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{c.label}</span>
                  <span className="text-white font-medium">{c.value} sessions</span>
                </div>
                <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', c.color)}
                    style={{ width: `${(c.value / totalCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Strengths / weaknesses */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
              <Trophy size={16} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Strongest Category</p>
                <p className="text-sm font-semibold text-green-400">
                  {stats.strongestCategory.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
              <Target size={16} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Needs Improvement</p>
                <p className="text-sm font-semibold text-red-400">
                  {stats.weakestCategory.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl">
              <CheckCircle2 size={16} className="text-brand-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-sm font-semibold text-brand-400">
                  {stats.totalSessions > 0
                    ? `${Math.round((stats.completedSessions / stats.totalSessions) * 100)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Preferred language + difficulty */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Your Preferences</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 mb-1">Default Difficulty</p>
            <span className={cn(
              'badge border',
              profile.defaultDifficulty === 'EASY'   ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              profile.defaultDifficulty === 'MEDIUM'  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            )}>
              {profile.defaultDifficulty}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Preferred Language</p>
            <span className="badge border bg-brand-500/10 text-brand-400 border-brand-500/20">
              {profile.preferredLanguage}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
 
 
// ════════════════════════════════════════════════════════════════
// EDIT PROFILE TAB
// ════════════════════════════════════════════════════════════════
function EditTab({ profile, onSave, saving }: { profile: any; onSave: (d: any) => void; saving: boolean }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: profile.fullName ?? '',
      email:    profile.email    ?? '',
      bio:      profile.bio      ?? '',
      location: profile.location ?? '',
    },
  })
 
  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3.5 text-gray-500" />
              <input {...register('fullName')} className="input-field pl-9" placeholder="Your name" />
            </div>
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message as string}</p>}
          </div>
 
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3.5 text-gray-500" />
              <input {...register('email')} type="email" className="input-field pl-9" placeholder="you@example.com" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message as string}</p>}
          </div>
        </div>
 
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            Location <span className="text-gray-600">(optional)</span>
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-3.5 text-gray-500" />
            <input {...register('location')} className="input-field pl-9" placeholder="City, Country" />
          </div>
        </div>
 
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            Bio <span className="text-gray-600">(optional, max 300 characters)</span>
          </label>
          <textarea
            {...register('bio')}
            rows={3}
            className="input-field resize-none"
            placeholder="Tell us about yourself — your goals, background, or what you're preparing for…"
          />
          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message as string}</p>}
        </div>
 
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-40"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
 
 
// ════════════════════════════════════════════════════════════════
// PLATFORMS TAB
// ════════════════════════════════════════════════════════════════
const PLATFORMS = [
  { key: 'githubUrl',     label: 'GitHub',      icon: <Github size={16} />,    placeholder: 'https://github.com/username',          color: 'text-gray-300' },
  { key: 'linkedinUrl',   label: 'LinkedIn',    icon: <Linkedin size={16} />,  placeholder: 'https://linkedin.com/in/username',     color: 'text-blue-400' },
  { key: 'leetcodeUrl',   label: 'LeetCode',    icon: <Code2 size={16} />,     placeholder: 'https://leetcode.com/username',        color: 'text-amber-400' },
  { key: 'hackerrankUrl', label: 'HackerRank',  icon: <Code2 size={16} />,     placeholder: 'https://hackerrank.com/username',      color: 'text-green-400' },
  { key: 'codeforcesUrl', label: 'Codeforces',  icon: <Code2 size={16} />,     placeholder: 'https://codeforces.com/profile/user',  color: 'text-blue-300' },
  { key: 'websiteUrl',    label: 'Website',     icon: <ExternalLink size={16} />, placeholder: 'https://yourwebsite.com',           color: 'text-purple-400' },
]
 
function PlatformsTab({ profile, onSave, saving }: { profile: any; onSave: (d: any) => void; saving: boolean }) {
  const { register, handleSubmit, formState: { isDirty } } = useForm({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      githubUrl:      profile.githubUrl      ?? '',
      linkedinUrl:    profile.linkedinUrl    ?? '',
      leetcodeUrl:    profile.leetcodeUrl    ?? '',
      hackerrankUrl:  profile.hackerrankUrl  ?? '',
      codeforcesUrl:  profile.codeforcesUrl  ?? '',
      websiteUrl:     profile.websiteUrl     ?? '',
    },
  })
 
  return (
    <div className="card p-6">
      <p className="text-sm text-gray-400 mb-6">
        Add your coding platform profiles. They'll appear on your profile header
        and help interviewers know your background.
      </p>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        {PLATFORMS.map(p => (
          <div key={p.key}>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5 font-medium">
              <span className={p.color}>{p.icon}</span>
              {p.label}
            </label>
            <div className="relative">
              <Link size={13} className="absolute left-3 top-3.5 text-gray-600" />
              <input
                {...register(p.key as any)}
                type="url"
                className="input-field pl-9"
                placeholder={p.placeholder}
              />
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-40"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Links'}
        </button>
      </form>
    </div>
  )
}
 
 
// ════════════════════════════════════════════════════════════════
// PREFERENCES TAB
// ════════════════════════════════════════════════════════════════
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
const LANGUAGES    = ['python', 'javascript', 'java', 'cpp', 'go', 'typescript']
 
function PreferencesTab({ profile, onSave, saving }: { profile: any; onSave: (d: any) => void; saving: boolean }) {
  const [diff,       setDiff]       = useState(profile.defaultDifficulty ?? 'MEDIUM')
  const [lang,       setLang]       = useState(profile.preferredLanguage ?? 'python')
  const [emailNotif, setEmailNotif] = useState(profile.emailNotifications ?? true)
 
  const handleSave = () => {
    onSave({ defaultDifficulty: diff, preferredLanguage: lang, emailNotifications: emailNotif })
  }
 
  const diffColor = { EASY: 'border-green-500/60 bg-green-500/10 text-green-400',
                      MEDIUM: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400',
                      HARD: 'border-red-500/60 bg-red-500/10 text-red-400' } as Record<string, string>
 
  return (
    <div className="card p-6 space-y-8">
      {/* Default difficulty */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Default Difficulty</h3>
        <p className="text-xs text-gray-500 mb-3">
          Pre-selected when you start a new interview session.
        </p>
        <div className="flex gap-3">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={cn(
                'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                diff === d ? diffColor[d] : 'border-surface-border text-gray-400 hover:text-white',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
 
      {/* Preferred language */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Preferred Coding Language</h3>
        <p className="text-xs text-gray-500 mb-3">
          Pre-selected in the code editor for coding questions.
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm font-mono transition-all',
                lang === l
                  ? 'border-brand-500/60 bg-brand-500/10 text-brand-400'
                  : 'border-surface-border text-gray-400 hover:text-white',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
 
      {/* Email notifications */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Notifications</h3>
        <button
          onClick={() => setEmailNotif(!emailNotif)}
          className="flex items-center justify-between w-full p-4 card hover:bg-surface-raised/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell size={16} className={emailNotif ? 'text-brand-400' : 'text-gray-500'} />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-gray-500">Session summaries and progress reports</p>
            </div>
          </div>
          <div className={cn(
            'w-10 h-6 rounded-full border-2 transition-all relative flex-shrink-0',
            emailNotif ? 'bg-brand-600 border-brand-500' : 'bg-surface-border border-surface-border',
          )}>
            <div className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
              emailNotif ? 'left-4' : 'left-0.5',
            )} />
          </div>
        </button>
      </div>
 
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2 disabled:opacity-40"
      >
        <Save size={15} />
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}
 
 
// ════════════════════════════════════════════════════════════════
// SECURITY TAB
// ════════════════════════════════════════════════════════════════
function SecurityTab({ onDeleteRequest }: { onDeleteRequest: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  })
 
  const mutation = useMutation({
    mutationFn: (d: any) =>
      fetch('/api/v1/profile/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage') ?? '{}')?.state?.token}`,
        },
        body: JSON.stringify({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
      }).then(r => { if (!r.ok) throw r; return r }),
    onSuccess: () => { toast.success('Password changed!'); reset() },
    onError:   () => toast.error('Current password is incorrect'),
  })
 
  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Change Password</h3>
        </div>
 
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Current Password</label>
            <input {...register('currentPassword')} type="password" className="input-field" placeholder="••••••••" />
            {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message as string}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
            <input {...register('newPassword')} type="password" className="input-field" placeholder="Min. 8 characters" />
            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message as string}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Confirm New Password</label>
            <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Repeat new password" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            <Lock size={15} />
            {mutation.isPending ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
 
      {/* Danger zone */}
      <div className="card p-6 border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete your account and all associated data including sessions,
          answers, analytics, and progress. This cannot be undone.
        </p>
        <button
          onClick={onDeleteRequest}
          className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20
                     border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl
                     text-sm font-medium transition-all"
        >
          <Trash2 size={14} /> Delete My Account
        </button>
      </div>
    </div>
  )
}