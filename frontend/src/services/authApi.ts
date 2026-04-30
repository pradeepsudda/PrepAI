import api from './api'
import type { AuthResponse, User } from '@/types'
 
export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, fullName }),
 
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
 
  getMe: () =>
    api.get<User>('/auth/me'),
 
  updateProfile: (fullName: string) =>
    api.put<User>('/auth/me', { fullName }),
 
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/me/password', { currentPassword, newPassword }),
}
 