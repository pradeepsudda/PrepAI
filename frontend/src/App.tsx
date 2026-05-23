import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider }  from '@tanstack/react-query'
import { Toaster }                            from 'react-hot-toast'
import { useAuthStore, getTokenExpiryMs }     from '@/store/authStore'
import { useEffect }                          from 'react'
import Layout                                 from '@/components/ui/Layout'
 
import LoginPage             from '@/pages/LoginPage'
import RegisterPage          from '@/pages/RegisterPage'
import DashboardPage         from '@/pages/DashboardPage'
import InterviewSetupPage    from '@/pages/InterviewSetupPage'
import HybridInterviewPage   from './pages/HybridInterviewPage'
import CodingChallengesPage  from '@/pages/CodingChallengesPage'
import CodingPage            from '@/pages/CodingPage'
import SessionReviewPage     from '@/pages/SessionReviewPage'
import AnalyticsPage         from '@/pages/AnalyticsPage'
import LiveRoomsPage         from '@/pages/LiveRoomsPage'
import ResumePage            from '@/pages/ResumePage'
import RoomPage              from '@/pages/RoomPage'
import ProfilePage           from '@/pages/ProfilePage'
import ResourcesPage from '@/pages/ResourcesPage'
 
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) return false
        return failureCount < 1
      },
      staleTime: 30_000,
    },
  },
})
 
function TokenExpiryWatcher() {
  const { token, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
 
  useEffect(() => {
    if (!isAuthenticated || !token) return
 
    const expiryMs = getTokenExpiryMs(token)
    if (!expiryMs) return
 
    const msUntilExpiry = expiryMs - Date.now()
 
    if (msUntilExpiry <= 0) {
      logout()
      navigate('/login', { replace: true })
      return
    }
 
    const msUntilLogout = Math.max(msUntilExpiry - 30_000, 0)
 
    const timer = setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, msUntilLogout)
 
    return () => clearTimeout(timer)
  }, [token, isAuthenticated]) 
 
  return null
}
 
function Guard({ children }: { children: React.ReactNode }) {
  const ok = useAuthStore((s) => s.isAuthenticated)
  return ok ? <>{children}</> : <Navigate to="/login" replace />
}
 
function GuestOnly({ children }: { children: React.ReactNode }) {
  const ok = useAuthStore((s) => s.isAuthenticated)
  return ok ? <Navigate to="/dashboard" replace /> : <>{children}</>
}
 
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Guard>
      <Layout>{children}</Layout>
    </Guard>
  )
}
 
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TokenExpiryWatcher />
 
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
 
          <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
 
          <Route path="/dashboard"           element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/interview"           element={<AppShell><InterviewSetupPage /></AppShell>} />
          <Route path="/sessions/:sessionId" element={<AppShell><SessionReviewPage /></AppShell>} />
          <Route path="/analytics"           element={<AppShell><AnalyticsPage /></AppShell>} />
          <Route path="/rooms"               element={<AppShell><LiveRoomsPage /></AppShell>} />
          <Route path="/resume"              element={<AppShell><ResumePage /></AppShell>} />
 
          <Route path="/interview/:sessionId" element={<HybridInterviewPage />} />
          <Route path="/coding"               element={<AppShell><CodingChallengesPage /></AppShell>} />
          <Route path="/coding/:challengeId"  element={<Guard><CodingPage /></Guard>} />
          <Route path="/rooms/:roomId"        element={<Guard><RoomPage /></Guard>} />
          <Route path="/profile" element={<AppShell><ProfilePage /></AppShell>} />
          <Route path="/resources" element={<AppShell><ResourcesPage /></AppShell>} />
 
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
 
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111420', color: '#f1f5f9', border: '1px solid #242840' },
          success: { iconTheme: { primary: '#4ade80', secondary: '#111420' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#111420' } },
        }}
      />
    </QueryClientProvider>
  )
}