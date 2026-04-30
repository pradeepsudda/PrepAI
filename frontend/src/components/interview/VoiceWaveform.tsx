interface Props { isActive: boolean; bars?: number }
 
export function VoiceWaveform({ isActive, bars = 5 }: Props) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-green-400"
          style={{
            height: isActive ? '100%' : '30%',
            animation: isActive
              ? `wave 1.2s ease-in-out ${i * 0.12}s infinite`
              : 'none',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}