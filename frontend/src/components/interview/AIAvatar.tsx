import { cn } from '@/utils/cn'
 
interface Props { isSpeaking?: boolean; isListening?: boolean }
 
export function AIAvatar({ isSpeaking, isListening }: Props) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className={cn(
        'relative w-20 h-20 rounded-2xl flex items-center justify-center text-3xl',
        'bg-gradient-to-br from-brand-600/30 to-brand-900/50',
        'border-2 transition-all duration-500',
        isSpeaking  ? 'border-brand-400 shadow-lg shadow-brand-500/30' :
        isListening ? 'border-green-400 shadow-lg shadow-green-500/30' :
                      'border-surface-border',
      )}>
        🤖
        {(isSpeaking || isListening) && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20
                           bg-brand-500 pointer-events-none" />
        )}
      </div>
      <span className={cn(
        'text-xs font-medium px-2.5 py-1 rounded-full border transition-all',
        isSpeaking  ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' :
        isListening ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                      'text-gray-500 bg-surface-raised border-surface-border',
      )}>
        {isSpeaking ? 'Speaking…' : isListening ? 'Listening…' : 'AI Interviewer'}
      </span>
    </div>
  )
}