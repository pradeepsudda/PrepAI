export function EvaluatingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-surface-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent
                        border-t-brand-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-brand-600/10 flex items-center justify-center text-xl">
          🤖
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-medium">Evaluating your answer…</p>
        <p className="text-sm text-gray-500 mt-1">AI is analysing your response</p>
      </div>
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  )
}