import { useNavigate }   from 'react-router-dom'
import { useQuery }      from '@tanstack/react-query'
import { Plus, Zap, Target, TrendingUp, Award } from 'lucide-react'
import { interviewApi }  from '@/services/interviewApi'
import { analyticsApi }  from '@/services/analyticsApi'
import { useAuthStore }  from '@/store/authStore'
import { PageHeader }    from '@/components/ui/PageHeader'
import { StatCard }      from '@/components/ui/StatCard'
import { SessionCard }   from '@/components/interview/SessionCard'
import { PageLoader }    from '@/components/ui/LoadingSpinner'
import { EmptyState }    from '@/components/ui/EmptyState'
import { sessionTypeIcon } from '@/utils/format'
 
export default function DashboardPage() {
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
 
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => interviewApi.getSessions().then(r => r.data),
  })
 
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn:  () => analyticsApi.getDashboard().then(r => r.data),
  })
 
  const recentSessions = sessions?.slice(0, 5) ?? []
 
  const QUICK_STARTS = [
    { type: 'DSA',           diff: 'MEDIUM', label: 'DSA Practice'    },
    { type: 'SYSTEM_DESIGN', diff: 'MEDIUM', label: 'System Design'   },
    { type: 'BEHAVIORAL',    diff: 'EASY',   label: 'Behavioral'      },
    { type: 'MIXED',         diff: 'MEDIUM', label: 'Mixed Round'     },
  ] as const
 
  if (sessionsLoading) return <PageLoader />
 
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Ready for your next interview round?"
        action={
          <button onClick={() => navigate('/interview')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Session
          </button>
        }
      />
 
      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Sessions"   value={analytics.totalSessionsAllTime}          icon={<Zap size={16} />} />
          <StatCard label="Average Score"    value={`${analytics.avgScore.toFixed(1)}%`}     icon={<Target size={16} />} />
          <StatCard label="Completion Rate"  value={`${analytics.completionRatePercent.toFixed(0)}%`} icon={<TrendingUp size={16} />} />
          <StatCard label="Strong Topics"    value={analytics.strongTopics.length}            icon={<Award size={16} />} />
        </div>
      )}
 
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick start */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Start
          </h2>
          <div className="space-y-2">
            {QUICK_STARTS.map(({ type, diff, label }) => (
              <button
                key={type}
                onClick={() => navigate('/interview', { state: { sessionType: type, difficulty: diff } })}
                className="w-full card p-4 flex items-center gap-3 text-left
                           hover:border-brand-500/30 hover:bg-surface-raised/30 transition-all"
              >
                <span className="text-2xl">{sessionTypeIcon[type]}</span>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500">{diff.toLowerCase()} difficulty</p>
                </div>
              </button>
            ))}
          </div>
 
          {/* Weak topics */}
          {analytics && analytics.weakTopics.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Focus Areas
              </h2>
              <div className="card p-4">
                <p className="text-xs text-gray-500 mb-3">Topics needing practice:</p>
                <div className="flex flex-wrap gap-2">
                  {analytics.weakTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => navigate('/interview', { state: { topic } })}
                      className="text-xs bg-red-500/10 text-red-400 border border-red-500/20
                                 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
 
        {/* Recent sessions */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Sessions
          </h2>
          {recentSessions.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No sessions yet"
              description="Start a practice session to track your progress"
              action={
                <button onClick={() => navigate('/interview')} className="btn-primary">
                  Start practicing
                </button>
              }
            />
          ) : (
            <div className="space-y-2">
              {recentSessions.map(s => <SessionCard key={s.id} session={s} />)}
              {sessions && sessions.length > 5 && (
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full text-center text-sm text-brand-400 hover:text-brand-300 py-2"
                >
                  View all {sessions.length} sessions →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
 
function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}