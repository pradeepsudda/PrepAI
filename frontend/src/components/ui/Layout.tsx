import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mic, Code2, BarChart2, Users,
  FileText, LogOut, Menu, X, ChevronRight, 
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
 
const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/interview',  icon: Mic,             label: 'Practice'     },
  { to: '/coding',     icon: Code2,           label: 'Coding'       },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics'    },
  { to: '/rooms',      icon: Users,           label: 'Live Rooms'   },
  { to: '/resume',     icon: FileText,        label: 'Resume'       },
]
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout }              = useAuthStore()
  const navigate                      = useNavigate()
 
  const handleLogout = () => { logout(); navigate('/login') }
 
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
 
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      {/* ── Sidebar ── */}
      <aside className={cn(
        'fixed lg:relative inset-y-0 left-0 z-30',
        'flex flex-col w-60 bg-surface-card border-r border-surface-border',
        'transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-border">
          {/* <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div> */}
          <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/prepai.png"   // or your generated image path
              alt="PrepAI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">PrepAI</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400">
            <X size={18} />
          </button>
        </div>
 
        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-raised',
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
 
        {/* User section */}
        <div className="px-3 py-4 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30
                            flex items-center justify-center text-brand-400 text-sm font-semibold">
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
 
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3
                           bg-surface-card border-b border-surface-border">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white">PrepAI</span>
        </header>
 
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}