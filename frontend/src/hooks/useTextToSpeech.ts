import { useCallback, useRef } from 'react'
 
export function useTextToSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
 
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
 
    const utterance   = new SpeechSynthesisUtterance(text)
    utterance.rate    = 0.92
    utterance.pitch   = 1.0
    utterance.volume  = 0.9
 
    // Prefer a natural-sounding voice if available
    const voices    = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US'
    )
    if (preferred) utterance.voice = preferred
 
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])
 
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])
 
  return { speak, stop }
}