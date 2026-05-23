import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
 
interface AuthState {
  token:           string | null
  user:            User   | null
  isAuthenticated: boolean
  setAuth:    (token: string, user: User) => void
  updateUser: (user: User) => void
  logout:     () => void
}
 
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:           null,
      user:            null,
      isAuthenticated: false,
      setAuth:    (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (user)        => set({ user }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user:  state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const hasValidToken = !!(
            state.token && !isTokenExpiredStatic(state.token)
          )
          if (!hasValidToken && state.token) {
            state.token           = null
            state.user            = null
            state.isAuthenticated = false
          } else {
            state.isAuthenticated = hasValidToken
          }
        }
      },
    }
  )
)
 
function isTokenExpiredStatic(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
 
export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch {
    return null
  }
}