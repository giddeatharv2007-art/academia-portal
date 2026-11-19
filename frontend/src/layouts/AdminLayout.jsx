import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileDropdown from '../components/common/ProfileDropdown'
import CursorAnimation from '../components/common/CursorAnimation'
import {
  LayoutDashboard, Users, Building2, ShieldCheck, BarChart3,
  GraduationCap, LogOut, ChevronLeft, ChevronRight, Menu,
  Bell, Activity, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

// Nav items are generated dynamically based on base path and role
function getNavItems(base, isCollege) {
  const items = [
    { to: `${base}/dashboard`,              icon: LayoutDashboard, label: 'Dashboard',        badge: null  },
    { to: `${base}/students`,               icon: Users,            label: 'Students',         badge: null  },
    { to: `${base}/companies`,              icon: Building2,        label: 'All Companies',    badge: null  },
    // Only super admin can verify companies
    ...(!isCollege ? [{ to: `${base}/companies/verification`, icon: ShieldCheck, label: 'Verify Companies', badge: 'new' }] : []),
    { to: `${base}/analytics`,              icon: BarChart3,        label: 'Skill Analytics',  badge: null  },
    { to: `${base}/training`,               icon: GraduationCap,    label: 'Training Programs',badge: null  },
  ]
  return items
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isCollege = user?.role === 'college'
  const base = isCollege ? '/college' : '/admin'
  const navItems = getNavItems(base, isCollege)

  const handleLogout = async () => {
    await logout()
    toast.success('Session ended securely')
    navigate(isCollege ? '/login/college' : '/login/admin')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-[#0a0f1e] border-r border-slate-800/60
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/60
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/50">
          <Zap size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none">EduNexus</p>
            <p className="text-blue-400 text-xs mt-0.5 leading-none">
              {isCollege ? 'College Portal' : 'Super Admin'}
            </p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-600 hover:text-slate-400 transition-colors hidden lg:block flex-shrink-0">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
          <ShieldCheck size={13} className="text-blue-400 flex-shrink-0" />
          <span className="text-blue-400 text-xs font-medium">
            {isCollege ? 'College Admin Session' : 'Super Admin Session'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 mt-2 space-y-0.5">
        {(!collapsed || mobile) && (
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 py-2">
            Control Panel
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
              ${isActive
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
              } ${collapsed && !mobile ? 'justify-center' : ''}`
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            {(!collapsed || mobile) && (
              <>
                <span className="flex-1">{label}</span>
                {badge === 'new' && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">!</span>
                )}
              </>
            )}
            {/* Tooltip when collapsed */}
            {collapsed && !mobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg
                opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/60 space-y-1">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-300 text-xs font-medium truncate">{user?.email}</p>
              <p className="text-slate-600 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm
            text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <LogOut size={17} />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#060b18] relative">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-[#0a0f1e] border-b border-slate-800/60 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-300">
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-slate-500">/</span>
            <span className="text-slate-300 font-medium">
              {isCollege ? 'College Admin Panel' : 'EduNexus Super Admin'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Activity indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/40">
            <Activity size={12} className="text-green-400" />
            <span>All systems operational</span>
          </div>

          {/* Bell */}
          <button className="relative text-slate-500 hover:text-slate-300 transition-colors p-1.5">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <ProfileDropdown theme="dark" />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-[#060b18] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
