import api from './api'
import type { RoomDto } from '@/types'
 
export const roomApi = {
  createRoom:    ()           => api.post<RoomDto>('/rooms'),
  joinRoom:      (code: string) => api.get<RoomDto>(`/rooms/${code}/join`),
  closeRoom:     (code: string) => api.delete(`/rooms/${code}`),
  getActiveRooms: ()           => api.get<RoomDto[]>('/rooms'),
}