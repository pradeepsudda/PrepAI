import { useRef, useState, useCallback, useEffect } from 'react'
import type { WebRtcSignalMsg,  } from '@/types'
 
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },    // free Google STUN
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}
 
export function useRoomAudio(
  myEmail:          string,
  participants:     string[],
  sendWebRtcSignal: (type: string, to: string, payload: unknown) => void,
  onWebRtcSignalRef: React.MutableRefObject<((s: WebRtcSignalMsg) => void) | null>,
) {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [speaking,     setSpeaking]     = useState<string[]>([])   // who is speaking
  const [audioError,   setAudioError]   = useState<string | null>(null)
 
  // Map of peerEmail → RTCPeerConnection
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  // Map of peerEmail → <audio> element
  const audioElements   = useRef<Map<string, HTMLAudioElement>>(new Map())
  // Our own microphone stream
  const localStream     = useRef<MediaStream | null>(null)
 
  // ─── Register WebRTC signal handler ──────────────────────────
  useEffect(() => {
    onWebRtcSignalRef.current = async (signal: WebRtcSignalMsg) => {
      await handleIncomingSignal(signal)
    }
    return () => { onWebRtcSignalRef.current = null }
  }, [participants]) // eslint-disable-line
 
  // ─── Create RTCPeerConnection for a peer ─────────────────────
  const createPeerConnection = useCallback((peerEmail: string) => {
    if (peerConnections.current.has(peerEmail)) {
      return peerConnections.current.get(peerEmail)!
    }
 
    const pc = new RTCPeerConnection(ICE_SERVERS)
 
    // When we get ICE candidates, send them to the peer via STOMP
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRtcSignal('ICE_CANDIDATE', peerEmail, event.candidate)
      }
    }
 
    // When we receive the peer's audio track, play it
    pc.ontrack = (event) => {
      console.log('🔊 Got audio track from', peerEmail)
      let audio = audioElements.current.get(peerEmail)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audioElements.current.set(peerEmail, audio)
      }
      audio.srcObject = event.streams[0]
 
      // Detect when peer is speaking using AudioContext analyser
      detectSpeaking(peerEmail, event.streams[0])
    }
 
    pc.onconnectionstatechange = () => {
      console.log(`Peer ${peerEmail}: ${pc.connectionState}`)
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeer(peerEmail)
      }
    }
 
    peerConnections.current.set(peerEmail, pc)
    return pc
  }, [sendWebRtcSignal]) // eslint-disable-line
 
  // ─── Enable microphone + call all current peers ──────────────
  const enableAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate:       44100,
        },
        video: false,
      })
 
      localStream.current = stream
      setAudioEnabled(true)
      setAudioError(null)
      console.log('🎤 Microphone enabled')
 
      // Start a call with each participant already in the room
      for (const peerEmail of participants) {
        if (peerEmail !== myEmail) {
          await callPeer(peerEmail, stream)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied'
      setAudioError(msg)
      console.error('Mic error:', err)
    }
  }, [participants, myEmail]) // eslint-disable-line
 
  // ─── Disable microphone ──────────────────────────────────────
  const disableAudio = useCallback(() => {
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    setAudioEnabled(false)
 
    // Close all peer connections
    peerConnections.current.forEach((pc, email) => closePeer(email))
    setSpeaking([])
  }, []) // eslint-disable-line
 
  // ─── Initiate a call to a specific peer ──────────────────────
  const callPeer = async (peerEmail: string, stream: MediaStream) => {
    console.log('📞 Calling peer:', peerEmail)
    const pc = createPeerConnection(peerEmail)
 
    // Add our audio tracks to the connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
 
    // Create and send offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    sendWebRtcSignal('OFFER', peerEmail, offer)
  }
 
  // ─── Handle incoming WebRTC signals ──────────────────────────
  const handleIncomingSignal = async (signal: WebRtcSignalMsg) => {
    const { type, from, payload } = signal
    // const parsed = JSON.parse(payload)
    const parsed =
  typeof payload === "string" ? JSON.parse(payload) : payload;
 
    console.log('📨 WebRTC signal:', type, 'from:', from)
 
    switch (type) {
      case 'OFFER': {
        const pc = createPeerConnection(from)
 
        // Add our tracks if microphone is on
        if (localStream.current) {
          localStream.current.getTracks().forEach(t =>
            pc.addTrack(t, localStream.current!)
          )
        }
 
        await pc.setRemoteDescription(new RTCSessionDescription(parsed))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendWebRtcSignal('ANSWER', from, answer)
        break
      }
 
      case 'ANSWER': {
        const pc = peerConnections.current.get(from)
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(parsed))
        }
        break
      }
 
      case 'ICE_CANDIDATE': {
        const pc = peerConnections.current.get(from)
        if (pc && parsed) {
          await pc.addIceCandidate(new RTCIceCandidate(parsed))
        }
        break
      }
    }
  }
 
  // ─── Close and cleanup a peer connection ─────────────────────
  const closePeer = (peerEmail: string) => {
    peerConnections.current.get(peerEmail)?.close()
    peerConnections.current.delete(peerEmail)
    audioElements.current.get(peerEmail)?.remove()
    audioElements.current.delete(peerEmail)
    setSpeaking(prev => prev.filter(e => e !== peerEmail))
  }
 
  // ─── Detect when a peer is speaking (audio level analysis) ───
  const detectSpeaking = (peerEmail: string, stream: MediaStream) => {
    try {
      const ctx      = new AudioContext()
      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
 
      const data = new Uint8Array(analyser.frequencyBinCount)
      const THRESHOLD = 20   // 0-255 — adjust sensitivity here
 
      const check = () => {
        if (!peerConnections.current.has(peerEmail)) return   // peer left
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setSpeaking(prev =>
          avg > THRESHOLD
            ? prev.includes(peerEmail) ? prev : [...prev, peerEmail]
            : prev.filter(e => e !== peerEmail)
        )
        requestAnimationFrame(check)
      }
      check()
    } catch {
      // AudioContext not available in some environments — non-critical
    }
  }
 
  // ─── When a new participant joins, auto-call them if audio on ─
  useEffect(() => {
    if (!audioEnabled || !localStream.current) return
 
    for (const peerEmail of participants) {
      if (peerEmail !== myEmail && !peerConnections.current.has(peerEmail)) {
        console.log('New participant joined, calling:', peerEmail)
        callPeer(peerEmail, localStream.current)
      }
    }
  }, [participants]) // eslint-disable-line
 
  return {
    audioEnabled,
    speaking,
    audioError,
    enableAudio,
    disableAudio,
  }
}