import { cn } from '@/utils/cn'
 
interface Props { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }
 
export function ScoreCircle({ score, size = 'md', label }: Props) {
  const r        = size === 'lg' ? 44 : size === 'md' ? 34 : 24
  const cx       = r + 6
  const circ     = 2 * Math.PI * r
  const dash     = (score / 100) * circ
  const dims     = cx * 2
 
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171'
 
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dims, height: dims }}>
        <svg width={dims} height={dims} viewBox={`0 0 ${dims} ${dims}`}>
          {/* Background track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#242840" strokeWidth="4" />
          {/* Score arc */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-bold',
            size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-xs',
          )} style={{ color }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  )
}