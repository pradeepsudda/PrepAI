import { cn } from '@/utils/cn'
 
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-8 h-8 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
    </div>
  )
}
 
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-64">
      <div className="text-center">
        <LoadingSpinner className="mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}