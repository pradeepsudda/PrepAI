import { useQuery }    from '@tanstack/react-query'
import { analyticsApi } from '@/services/analyticsApi'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { PageHeader }  from '@/components/ui/PageHeader'
import { StatCard }    from '@/components/ui/StatCard'
import { PageLoader }  from '@/components/ui/LoadingSpinner'
import { Target, TrendingUp, Award, Zap } from 'lucide-react'
 
const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#111420', border: '1px solid #242840', borderRadius: 8, color: '#fff' },
}
 
export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn:  () => analyticsApi.getDashboard().then(r => r.data),
  })
 
  if (isLoading || !data) return <PageLoader />
 
  const radarData = Object.entries(data.categoryScores).map(([k, v]) => ({
    subject: k.replace('_', ' '), score: Math.round(v),
  }))
 
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <PageHeader title="Analytics" subtitle="Track your interview progress over time" />
 
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="All-Time Sessions"   value={data.totalSessionsAllTime}              icon={<Zap size={16} />} />
        <StatCard label="This Month"          value={data.totalSessionsLast30Days}           icon={<Target size={16} />} />
        <StatCard label="Average Score"       value={`${data.avgScore.toFixed(1)}%`}         icon={<TrendingUp size={16} />} />
        <StatCard label="Completion Rate"     value={`${data.completionRatePercent.toFixed(0)}%`} icon={<Award size={16} />} />
      </div>
 
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Score trend */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Score Trend (30 days)</h2>
          {data.scoreTrend.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Not enough data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.scoreTrend}>
                <XAxis dataKey="date" stroke="#333" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#333" tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
 
        {/* Skills radar */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Skills Radar</h2>
          {radarData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Complete sessions to see your radar</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#242840" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
 
      {/* Topics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-green-400 mb-4">💪 Strong Topics</h2>
          {data.strongTopics.length === 0
            ? <p className="text-gray-500 text-sm">Keep practising to identify strengths</p>
            : <div className="flex flex-wrap gap-2">
                {data.strongTopics.map(t => (
                  <span key={t} className="badge bg-green-500/10 text-green-400 border border-green-500/20">{t}</span>
                ))}
              </div>
          }
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-red-400 mb-4">📚 Focus Areas</h2>
          {data.weakTopics.length === 0
            ? <p className="text-gray-500 text-sm">No weak topics identified yet</p>
            : <div className="flex flex-wrap gap-2">
                {data.weakTopics.map(t => (
                  <span key={t} className="badge bg-red-500/10 text-red-400 border border-red-500/20">{t}</span>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}