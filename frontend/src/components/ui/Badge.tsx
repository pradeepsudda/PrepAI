import { cn } from '@/utils/cn'
 
interface Props {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}
 
export function Badge({ children, variant = 'default', className }: Props) {
  return (
    <span className={cn(
      'badge border',
      {
        default: 'bg-surface-raised text-gray-400 border-surface-border',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        danger:  'bg-red-500/10 text-red-400 border-red-500/20',
        info:    'bg-brand-500/10 text-brand-400 border-brand-500/20',
      }[variant],
      className,
    )}>
      {children}
    </span>
  )
}