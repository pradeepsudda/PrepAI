import { useRef, useState, useCallback, useEffect } from 'react'
import type { WebRtcSignalMsg } from '@/types'

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls:       'turn:openrelay.metered.ca:80',
      username:   'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls:       'turn:openrelay.metered.ca:443',
      username:   'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls:       'turn:openrelay.metered.ca:443?transport=tcp',
      username:   'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
}

export function useRoomAudio(
  myEmail:           string,
  participants:      string[],
  sendWebRtcSignal:  (type: string, to: string, payload: unknown) => void,
  onWebRtcSignalRef: React.MutableRefObject<((s: WebRtcSignalMsg) => void) | null>,
) {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [muted,        setMuted]        = useState(false)
  const [speaking,     setSpeaking]     = useState<string[]>([])
  const [audioError,   setAudioError]   = useState<string | null>(null)

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const audioElements   = useRef<Map<string, HTMLAudioElement>>(new Map())
  const localStream     = useRef<MediaStream | null>(null)
  const audioCtxRef     = useRef<AudioContext | null>(null)

  const iceCandidateQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())

  useEffect(() => {
    onWebRtcSignalRef.current = (signal: WebRtcSignalMsg) => {
      handleSignal(signal).catch(e => console.error('Signal error:', e))
    }
    return () => { onWebRtcSignalRef.current = null }
  })

  const getPeer = useCallback((peerEmail: string): RTCPeerConnection => {
    if (peerConnections.current.has(peerEmail)) {
      return peerConnections.current.get(peerEmail)!
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        sendWebRtcSignal('ICE_CANDIDATE', peerEmail, candidate.toJSON())
      }
    }

    pc.onicecandidateerror = (e) => {
      console.warn(`ICE candidate error for ${peerEmail}:`, e)
    }

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state for ${peerEmail}: ${pc.iceConnectionState}`)
      if (pc.iceConnectionState === 'failed') {
        console.log('ICE failed — attempting restart...')
        pc.restartIce()
      }
    }

    pc.ontrack = ({ streams }) => {
      console.log('🔊 Audio track received from', peerEmail)

      const old = audioElements.current.get(peerEmail)
      if (old) { old.srcObject = null; old.remove() }

      const audio = document.createElement('audio')
      audio.autoplay    = true,
      (audio as any).playsInline = true
      audio.muted       = false
      audio.style.display = 'none'
      document.body.appendChild(audio)
      audio.srcObject = streams[0]

      audio.play().catch(err => {
        console.warn('Audio autoplay blocked:', err)
        const retry = () => {
          audio.play().catch(console.error)
          document.removeEventListener('click', retry)
        }
        document.addEventListener('click', retry, { once: true })
      })

      audioElements.current.set(peerEmail, audio)
      watchSpeaking(peerEmail, streams[0])
    }

    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${peerEmail}: ${pc.connectionState}`)
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        teardownPeer(peerEmail)
      }
    }

    peerConnections.current.set(peerEmail, pc)
    iceCandidateQueue.current.set(peerEmail, [])
    return pc
  }, [sendWebRtcSignal])

  const enableAudio = useCallback(async () => {
    try {
      setAudioError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation:    true,
          noiseSuppression:    true,
          autoGainControl:     true,
          sampleRate:          48000,
        },
        video: false,
      })

      localStream.current   = stream
      audioCtxRef.current   = new AudioContext()
      setAudioEnabled(true)

      watchSpeaking(myEmail, stream)

      for (const peer of participants) {
        if (peer !== myEmail) {
          await initCall(peer, stream)
        }
      }
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
        : err instanceof Error ? err.message : 'Failed to access microphone'
      setAudioError(msg)
      console.error('enableAudio error:', err)
    }
  }, [participants, myEmail])

  const disableAudio = useCallback(() => {
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    peerConnections.current.forEach((_, email) => teardownPeer(email))
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    iceCandidateQueue.current.clear()
    setSpeaking([])
    setAudioEnabled(false)
    setMuted(false)
  }, []) 

  const toggleMute = useCallback(() => {
    const track = localStream.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }, [])

  const initCall = async (peerEmail: string, stream: MediaStream) => {
    console.log('📞 Calling', peerEmail)
    const pc = getPeer(peerEmail)

    stream.getTracks().forEach(track => {
      if (!pc.getSenders().find(s => s.track === track)) {
        pc.addTrack(track, stream)
      }
    })

    const offer = await pc.createOffer({ offerToReceiveAudio: true })
    await pc.setLocalDescription(offer)
    sendWebRtcSignal('OFFER', peerEmail, { type: offer.type, sdp: offer.sdp })
  }

  const handleSignal = async ({ type, from, payload }: WebRtcSignalMsg) => {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
    console.log(`📨 ${type} from ${from}`)

    switch (type) {
      case 'OFFER': {
        const pc = getPeer(from)

        if (localStream.current) {
          localStream.current.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) {
              pc.addTrack(track, localStream.current!)
            }
          })
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription(parsed as RTCSessionDescriptionInit)
        )

        await flushIceCandidates(from, pc)

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendWebRtcSignal('ANSWER', from, { type: answer.type, sdp: answer.sdp })
        break
      }

      case 'ANSWER': {
        const pc = peerConnections.current.get(from)
        if (!pc) break
        await pc.setRemoteDescription(
          new RTCSessionDescription(parsed as RTCSessionDescriptionInit)
        )
        await flushIceCandidates(from, pc)
        break
      }

      case 'ICE_CANDIDATE': {
        const pc = peerConnections.current.get(from)
        if (!pc) break

        if (!pc.remoteDescription) {
          console.log(`Queuing ICE candidate for ${from} (no remote desc yet)`)
          const queue = iceCandidateQueue.current.get(from) ?? []
          queue.push(parsed as RTCIceCandidateInit)
          iceCandidateQueue.current.set(from, queue)
        } else {
          await pc.addIceCandidate(new RTCIceCandidate(parsed as RTCIceCandidateInit))
            .catch(e => console.warn('addIceCandidate error:', e))
        }
        break
      }
    }
  }

  const flushIceCandidates = async (peerEmail: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueue.current.get(peerEmail) ?? []
    console.log(`Flushing ${queue.length} queued ICE candidates for ${peerEmail}`)
    for (const candidate of queue) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.warn('Flush ICE error:', e))
    }
    iceCandidateQueue.current.set(peerEmail, [])
  }

  const teardownPeer = (peerEmail: string) => {
    peerConnections.current.get(peerEmail)?.close()
    peerConnections.current.delete(peerEmail)
    const el = audioElements.current.get(peerEmail)
    if (el) { el.srcObject = null; el.remove(); audioElements.current.delete(peerEmail) }
    iceCandidateQueue.current.delete(peerEmail)
    setSpeaking(prev => prev.filter(e => e !== peerEmail))
  }

  const watchSpeaking = (email: string, stream: MediaStream) => {
    if (!audioCtxRef.current) return
    try {
      const ctx      = audioCtxRef.current
      const src      = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize               = 256
      analyser.smoothingTimeConstant = 0.8
      src.connect(analyser)

      const buf       = new Uint8Array(analyser.frequencyBinCount)
      const THRESHOLD = 15
      let   last      = false

      const tick = () => {
        if (!stream.active) return
        analyser.getByteFrequencyData(buf)
        const avg  = buf.reduce((a, b) => a + b, 0) / buf.length
        const now  = avg > THRESHOLD
        if (now !== last) {
          last = now
          setSpeaking(prev =>
            now
              ? prev.includes(email) ? prev : [...prev, email]
              : prev.filter(e => e !== email)
          )
        }
        requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      console.warn('Speaking detection unavailable:', e)
    }
  }

  useEffect(() => {
    if (!audioEnabled || !localStream.current) return
    for (const peer of participants) {
      if (peer !== myEmail && !peerConnections.current.has(peer)) {
        console.log('Auto-calling new participant:', peer)
        initCall(peer, localStream.current).catch(console.error)
      }
    }
  }, [participants]) 

  return { audioEnabled, muted, speaking, audioError, enableAudio, disableAudio, toggleMute }
}