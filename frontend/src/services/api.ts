import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
 
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})
 
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
 
api.interceptors.request.use(
  (config) => {
    const { token, logout } = useAuthStore.getState()
    if (token) {
      if (isTokenExpired(token)) {
        logout() 
        window.location.replace('/login')
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()  
      window.location.replace('/login')  
    }
    return Promise.reject(err)
  }
)
 
export default api