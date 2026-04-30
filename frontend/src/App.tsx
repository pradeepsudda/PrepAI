import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/ui/Layout'

import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import DashboardPage      from '@/pages/DashboardPage'
import InterviewSetupPage from '@/pages/InterviewSetupPage'
import VoiceInterviewPage from '@/pages/VoiceInterviewPage'
import CodingChallengesPage from '@/pages/CodingChallengesPage'
import CodingPage           from '@/pages/CodingPage'
import SessionReviewPage  from '@/pages/SessionReviewPage'
import AnalyticsPage      from '@/pages/AnalyticsPage'
import LiveRoomsPage      from '@/pages/LiveRoomsPage'
import ResumePage         from '@/pages/ResumePage'
import RoomPage           from '@/pages/RoomPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

/** Redirect to /login if not authenticated */
function Guard({ children }: { children: React.ReactNode }) {
  const ok = useAuthStore((s) => s.isAuthenticated)
  return ok ? <>{children}</> : <Navigate to="/login" replace />
}

/** Redirect to /dashboard if already authenticated */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const ok = useAuthStore((s) => s.isAuthenticated)
  return ok ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

/** Authenticated pages that live inside the sidebar layout */
function AppShell({ children }: { children : React.ReactNode }) {
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
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Auth (no sidebar) ── */}
          <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* ── App shell pages (with sidebar) ── */}
          <Route path="/dashboard"           element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/interview"           element={<AppShell><InterviewSetupPage /></AppShell>} />
          <Route path="/sessions/:sessionId" element={<AppShell><SessionReviewPage /></AppShell>} />
          <Route path="/analytics"           element={<AppShell><AnalyticsPage /></AppShell>} />
          <Route path="/rooms"               element={<AppShell><LiveRoomsPage /></AppShell>} />
          <Route path="/resume"              element={<AppShell><ResumePage /></AppShell>} />

          {/* ── Fullscreen pages (no sidebar) ── */}
          {/* /interview/:sessionId — live voice interview session */}
          <Route path="/interview/:sessionId"    element={<Guard><VoiceInterviewPage /></Guard>} />
          {/* /coding — challenge list (with sidebar) */}
          <Route path="/coding"                  element={<AppShell><CodingChallengesPage /></AppShell>} />
          {/* /coding/:challengeId — fullscreen IDE */}
          <Route path="/coding/:challengeId"     element={<Guard><CodingPage /></Guard>} />
          {/* /rooms/:roomId — live collaborative room */}
          <Route path="/rooms/:roomId"           element={<Guard><RoomPage /></Guard>} />

          {/* Fallback */}
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
