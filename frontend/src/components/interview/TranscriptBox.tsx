import { VoiceWaveform } from './VoiceWaveform'
 
interface Props {
  transcript:  string
  isListening: boolean
  error?:      string | null
}
 
export function TranscriptBox({ transcript, isListening, error }: Props) {
  return (
    <div className="card p-5 w-full max-w-2xl min-h-32">
      {/* Status header */}
      <div className="flex items-center gap-2 mb-3">
        <VoiceWaveform isActive={isListening} />
        <span className={isListening ? 'text-green-400 text-xs' : 'text-gray-500 text-xs'}>
          {isListening ? 'Recording your answer…' : 'Your answer will appear here'}
        </span>
        {error && <span className="text-red-400 text-xs ml-auto">{error}</span>}
      </div>
 
      {/* Transcript */}
      <p className={transcript ? 'text-gray-200 leading-relaxed text-sm' : 'text-gray-600 text-sm italic'}>
        {transcript || 'Press "Start Answering" and speak your answer…'}
      </p>
    </div>
  )
}