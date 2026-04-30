import axios from 'axios'
 
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})
 
// Attach JWT to every request
api.interceptors.request.use((config) => {
  const raw   = localStorage.getItem('auth-storage')
  const token = raw ? JSON.parse(raw)?.state?.token : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
 
// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
 
export default api