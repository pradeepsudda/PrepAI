import { cn } from '@/utils/cn'
 
interface Props {
  label:     string
  value:     string | number
  icon?:     React.ReactNode
  trend?:    number   // positive = good
  className?: string
}
 
export function StatCard({ label, value, icon, trend, className }: Props) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        {icon && <div className="text-brand-400 opacity-80">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      {trend !== undefined && (
        <p className={cn('text-xs mt-1', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
        </p>
      )}
    </div>
  )
}