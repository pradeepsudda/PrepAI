import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTimeLeft(initialSeconds)
    setIsExpired(false)
    setIsRunning(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [initialSeconds])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }

          setIsRunning(false)
          setIsExpired(true)

          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setTimeLeft(initialSeconds)
    setIsExpired(false)
    setIsRunning(false)
  }, [initialSeconds])

  const format = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0')

    const s = (secs % 60)
      .toString()
      .padStart(2, '0')

    return `${m}:${s}`
  }

  return {
    timeLeft,
    isRunning,
    isExpired,
    formatted: format(timeLeft),
    start,
    pause,
    reset,
  }
}