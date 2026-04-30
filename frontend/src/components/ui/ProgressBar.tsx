import { cn } from '@/utils/cn'
 
interface Props { value: number; max?: number; color?: string; className?: string; label?: string }
 
export function ProgressBar({ value, max = 100, color, className, label }: Props) {
  const pct = Math.min(100, (value / max) * 100)
  const barColor = color ?? (pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500')
 
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-medium">{Math.round(value)}</span>
        </div>
      )}
      <div className="h-2 bg-surface-border rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}