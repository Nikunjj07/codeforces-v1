import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

// Default to same host if not specified, port 5000 for dev
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export function useWebSocket(contestId?: string) {
  const socketRef = useRef<Socket | null>(null)
  const qc = useQueryClient()

  useEffect(() => {
    // Initialize connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      if (contestId) {
        socket.emit('join:contest', contestId)
      }
    })

    socket.on('leaderboard:update', (data: { contestId: string; rankings: any[] }) => {
      // If we are looking at this contest, update specifically this contest's leaderboard cache
      if (contestId && data.contestId === contestId) {
        qc.setQueryData(['contest-leaderboard', contestId], data.rankings)
      }
      
      // Also invalidate global leaderboard to eventually reflect the new totals
      qc.invalidateQueries({ queryKey: ['global-leaderboard'] })
    })

    return () => {
      if (contestId) {
        socket.emit('leave:contest', contestId)
      }
      socket.disconnect()
      socketRef.current = null
    }
  }, [contestId, qc])

  return { socket: socketRef.current }
}
