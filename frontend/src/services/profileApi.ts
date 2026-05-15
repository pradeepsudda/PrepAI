import api from './api'
import type { ProfileData, UpdateProfilePayload, ChangePasswordPayload } from '@/types'
 
export const profileApi = {
  getProfile:     ()                              => api.get<ProfileData>('/profile'),
  updateProfile:  (data: UpdateProfilePayload)    => api.put<ProfileData>('/profile', data),
  changePassword: (data: ChangePasswordPayload)   => api.patch('/profile/password', data),
  deleteAccount:  (confirmPassword: string)       =>
    api.delete('/profile', { params: { confirmPassword } }),
}