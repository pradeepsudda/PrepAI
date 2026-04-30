// src/hooks/useRoomSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ChatMessage } from '@/types'

export function useRoomSocket(roomId: string, token: string) {
  const clientRef                       = useRef<Client | null>(null)
  const isConnectedRef                  = useRef(false)   // ← track connection state in ref
  const [messages, setMessages]         = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [sharedCode, setSharedCode]     = useState('')
  const [connected, setConnected]       = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    // Guard — don't connect without required values
    if (!roomId || !token) return

    const client = new Client({
      // SockJS as transport — falls back gracefully if WS not available
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

      // Send JWT so Spring Security can authenticate the WS handshake
      connectHeaders: { Authorization: `Bearer ${token}` },

      // Auto-reconnect after 3s if connection drops
      reconnectDelay: 3000,

      onConnect: () => {
        // ✅ Mark as connected in BOTH state and ref
        // ref is used in cleanup (sync), state triggers re-render (async)
        isConnectedRef.current = true
        setConnected(true)
        setError(null)

        // Subscribe to incoming chat messages
        client.subscribe(`/topic/room/${roomId}/messages`, (msg) => {
          setMessages(prev => [...prev, JSON.parse(msg.body)])
        })

        // Subscribe to room events (join/leave notifications)
        client.subscribe(`/topic/room/${roomId}/events`, (msg) => {
          const event = JSON.parse(msg.body)
          if (event.type === 'USER_JOINED') {
            setParticipants(prev =>
              prev.includes(event.userId) ? prev : [...prev, event.userId]
            )
          } else if (event.type === 'USER_LEFT') {
            setParticipants(prev => prev.filter(p => p !== event.userId))
          }
        })

        // Subscribe to shared code editor changes
        client.subscribe(`/topic/room/${roomId}/code`, (msg) => {
          const event = JSON.parse(msg.body)
          setSharedCode(event.code)
        })

        // Announce to everyone that this user joined
        client.publish({
          destination: `/app/room/${roomId}/join`,
          body:        JSON.stringify({}),
        })
      },

      onDisconnect: () => {
        isConnectedRef.current = false
        setConnected(false)
      },

      // Handle connection errors
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        isConnectedRef.current = false
        setConnected(false)
        setError(`Connection error: ${frame.headers?.message ?? 'Unknown'}`)
      },

      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection failed. Is the backend running?')
      },
    })

    client.activate()
    clientRef.current = client

    // ── Cleanup when component unmounts ─────────────────────────
    return () => {
      // ✅ FIX — only publish leave if actually connected
      // isConnectedRef.current is synchronously accurate unlike useState
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

  // Send a chat message — only if connected
  const sendMessage = useCallback((text: string) => {
    if (!clientRef.current?.connected) {
      console.warn('Cannot send message — not connected')
      return
    }
    clientRef.current.publish({
      destination: `/app/room/${roomId}/message`,
      body:        JSON.stringify({ text }),
    })
  }, [roomId])

  // Broadcast code editor changes to all room participants
  const syncCode = useCallback((code: string, language: string) => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/room/${roomId}/code`,
      body:        JSON.stringify({ code, language }),
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
  }
}