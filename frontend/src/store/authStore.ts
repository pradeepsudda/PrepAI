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
      // ✅ logout() calls set() which updates BOTH in-memory state
      // AND triggers Zustand persist middleware to update localStorage
      // Previously: localStorage.removeItem() only cleared storage,
      // leaving isAuthenticated:true in memory → Guard never redirected
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist token + user — not isAuthenticated
      // isAuthenticated is derived: true when token exists
      // This prevents stale isAuthenticated:true from persisting
      partialize: (state) => ({
        token: state.token,
        user:  state.user,
      }),
      // ✅ On rehydration: set isAuthenticated based on whether
      // token exists AND is not expired
      onRehydrateStorage: () => (state) => {
        if (state) {
          const hasValidToken = !!(
            state.token && !isTokenExpiredStatic(state.token)
          )
          if (!hasValidToken && state.token) {
            // Token exists but expired — clear it during rehydration
            // This handles the "opened app 6 days later" case
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
 
// Static version usable outside React (no hooks)
function isTokenExpiredStatic(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
 
// Exported for use in TokenExpiryGuard
export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch {
    return null
  }
}