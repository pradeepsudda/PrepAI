import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
 
interface Props {
  open:     boolean
  onClose:  () => void
  title?:   string
  children: React.ReactNode
  size?:    'sm' | 'md' | 'lg'
}
 
export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
 
  if (!open) return null
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
 
      {/* Modal */}
      <div className={cn(
        'relative bg-surface-card border border-surface-border rounded-2xl shadow-2xl',
        'animate-slide-up',
        { sm: 'w-full max-w-sm', md: 'w-full max-w-lg', lg: 'w-full max-w-2xl' }[size],
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
            <h3 className="font-display font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}