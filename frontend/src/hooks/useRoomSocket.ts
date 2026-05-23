import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ChatMessage, WebRtcSignalMsg,  } from '@/types'
 
export function useRoomSocket(
  roomId:          string,
  token:           string,
  onLanguageChange?: (lang: string) => void, 
) {
  const clientRef        = useRef<Client | null>(null)
  const isConnectedRef   = useRef(false)
 
  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [sharedCode,   setSharedCode]   = useState('')
  const [connected,    setConnected]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
 
  const onWebRtcSignalRef = useRef<((signal: WebRtcSignalMsg) => void) | null>(null)

  const BASE_URL = import.meta.env.VITE_API_BASE_URL
 
  useEffect(() => {
    if (!roomId || !token) return
 
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   3000,
 
      onConnect: () => {
        isConnectedRef.current = true
        setConnected(true)
        setError(null)
        console.log('✅ WebSocket connected, room:', roomId)
 
        client.subscribe(`/topic/room/${roomId}/messages`, (msg) => {
          setMessages(prev => [...prev, JSON.parse(msg.body)])
        })
 
        client.subscribe(`/topic/room/${roomId}/events`, (msg) => {
          const event = JSON.parse(msg.body)
          console.log('Room event:', event.type, event.participants)
 
          if (event.participants && Array.isArray(event.participants)) {
            setParticipants(event.participants)
          }
        })
 
        client.subscribe(`/topic/room/${roomId}/code`, (msg) => {
          const event = JSON.parse(msg.body)
          setSharedCode(event.code)
          if (event.language && onLanguageChange) {
            onLanguageChange(event.language)
          }
        })
 
        client.subscribe(`/user/queue/webrtc`, (msg) => {
          const signal = JSON.parse(msg.body)
          onWebRtcSignalRef.current?.(signal)
        })
 
        client.publish({
          destination: `/app/room/${roomId}/join`,
          body:        JSON.stringify({}),
        })
      },
 
      onDisconnect: () => {
        isConnectedRef.current = false
        setConnected(false)
      },
 
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        isConnectedRef.current = false
        setConnected(false)
        setError(`STOMP error: ${frame.headers?.message ?? 'Unknown'}`)
      },
 
      onWebSocketError: () => {
        setError('Cannot connect. Is the backend running on port 8080?')
      },
    })
 
    client.activate()
    clientRef.current = client
 
    return () => {
      if (isConnectedRef.current && client.connected) {
        client.publish({
          destination: `/app/room/${roomId}/leave`,
          body:        JSON.stringify({}),
        })
      }
      isConnectedRef.current = false
      client.deactivate()
    }
  }, [roomId, token]) 
 
  const sendMessage = useCallback((text: string) => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/room/${roomId}/message`,
      body:        JSON.stringify({ text }),
    })
  }, [roomId])
 
  const syncCode = useCallback((code: string, language: string) => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/room/${roomId}/code`,
      body:        JSON.stringify({ code, language }),
    })
  }, [roomId])
 
  const sendWebRtcSignal = useCallback((type: string, to: string, payload: unknown) => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/room/${roomId}/webrtc`,
      body: JSON.stringify({ type, to, payload: JSON.stringify(payload) }),
    })
  }, [roomId])
 
  return {
    messages,
    participants,
    sharedCode,
    connected,
    error,
    sendMessage,
    syncCode,
    sendWebRtcSignal,
    onWebRtcSignalRef,  
  }
}