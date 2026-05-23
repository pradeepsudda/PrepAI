import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft]       = useState(initialSeconds)
  const [isRunning, setIsRunning]     = useState(false)
  const [isExpired, setIsExpired]     = useState(false)
  const [lastInitial, setLastInitial] = useState(initialSeconds)
  const intervalRef                   = useRef<ReturnType<typeof setInterval>>()

  if (lastInitial !== initialSeconds) {
    setLastInitial(initialSeconds)
    setTimeLeft(initialSeconds)
    setIsExpired(false)
  }

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setIsExpired(true); setIsRunning(false); clearInterval(intervalRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setIsExpired(false)
    setTimeLeft(initialSeconds)
  }, [initialSeconds])

  const format = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return { timeLeft, isRunning, isExpired, formatted: format(timeLeft), start, pause, reset }
}
