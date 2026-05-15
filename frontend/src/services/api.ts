import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
 
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})
 
// ── Helper: decode JWT expiry without a library ───────────────
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds, Date.now() is milliseconds
    return payload.exp * 1000 < Date.now()
  } catch {
    return true  // malformed token → treat as expired
  }
}
 
// ── Request interceptor ───────────────────────────────────────
// FIX 1: Read token from Zustand store (not raw localStorage)
// FIX 2: Check expiry BEFORE sending — catches idle sessions
api.interceptors.request.use(
  (config) => {
    // ✅ Use Zustand getState() — works outside React components
    // This reads the live in-memory state, not stale localStorage
    const { token, logout } = useAuthStore.getState()
 
    if (token) {
      // Pre-flight expiry check — if expired, logout immediately
      // instead of waiting for backend to return 401
      if (isTokenExpired(token)) {
        logout()   // clears Zustand state + localStorage in one call
        window.location.replace('/login')
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
 
// ── Response interceptor ──────────────────────────────────────
// FIX 3: Call store.logout() — not just localStorage.removeItem()
// localStorage.removeItem only clears storage — Zustand in-memory
// isAuthenticated stays TRUE so Guard never redirects
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()  // ✅ clears BOTH in-memory Zustand state AND localStorage
      window.location.replace('/login')  // replace vs href — no back button to expired state
    }
    return Promise.reject(err)
  }
)
 
export default api