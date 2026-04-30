import { useState, useEffect, useRef, useCallback } from 'react'

// Local type definitions for the Web Speech API (not universally in TS DOM lib)
interface SpeechRecognitionResultItem {
  transcript: string
  confidence: number
}
interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionResultItem
}
interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent {
  error: string
}
interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechAPI(): SpeechRecognitionConstructor | undefined {
  const win = window as unknown as Record<string, unknown>
  return (win['SpeechRecognition'] ?? win['webkitSpeechRecognition']) as SpeechRecognitionConstructor | undefined
}

interface SpeechConfig {
  onTranscriptChange?: (transcript: string) => void
  onSilenceDetected?:  () => void
  silenceThresholdMs?: number
}

export function useSpeechRecognition(config: SpeechConfig = {}) {
  const [transcript, setTranscript]   = useState('')
  const [isListening, setIsListening] = useState(false)
  const [confidence, setConfidence]   = useState(0)
  const [isSupported]                 = useState(() => !!getSpeechAPI())
  const [error, setError]             = useState<string | null>(() =>
    getSpeechAPI() ? null : 'Speech recognition not supported in this browser. Please use Chrome or Edge.'
  )

  const recognitionRef  = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const startTimeRef    = useRef<number>(0)

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechAPI()
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous      = true
    recognition.interimResults  = true
    recognition.lang            = 'en-US'
    recognition.maxAlternatives = 1

    let finalTranscriptAccumulated = ''

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let newFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          newFinal += result[0].transcript
          setConfidence(result[0].confidence)
        } else {
          interim += result[0].transcript
        }
      }

      if (newFinal) {
        finalTranscriptAccumulated += newFinal
        setTranscript(finalTranscriptAccumulated)
        config.onTranscriptChange?.(finalTranscriptAccumulated)
      } else if (interim) {
        config.onTranscriptChange?.(finalTranscriptAccumulated + interim)
      }

      // Reset silence detection timer
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        if (finalTranscriptAccumulated.length > 30) {
          config.onSilenceDetected?.()
        }
      }, config.silenceThresholdMs ?? 3500)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setError(`Speech error: ${event.error}`)
      }
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    return () => {
      clearTimeout(silenceTimerRef.current)
      recognition.abort()
    }
  }, []) // eslint-disable-line

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')
    setError(null)
    startTimeRef.current = Date.now()
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setError('Could not start microphone. Is it already in use?')
    }
  }, [])

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current)
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const getDurationSeconds = useCallback(() =>
    Math.floor((Date.now() - startTimeRef.current) / 1000)
  , [])

  return {
    transcript,
    isListening,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    getDurationSeconds,
  }
}
