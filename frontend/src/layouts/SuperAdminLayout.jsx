import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileDropdown from '../components/common/ProfileDropdown'
import {
  LayoutDashboard, Users, Building2, ShieldCheck, BarChart3,
  GraduationCap, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Bell, Activity, Zap, Settings, Database, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/superadmin/dashboard',              icon: LayoutDashboard, label: 'Dashboard',         group: 'Overview'    },
  { to: '/superadmin/students',               icon: Users,           label: 'Students',           group: 'Management'  },
  { to: '/superadmin/companies',              icon: Building2,       label: 'All Companies',      group: 'Management'  },
  { to: '/superadmin/companies/verification', icon: ShieldCheck,     label: 'Verify Companies',   group: 'Management'  },
  { to: '/superadmin/analytics',             icon: BarChart3,       label: 'Analytics',          group: 'Reports'     },
  { to: '/superadmin/training',              icon: GraduationCap,   label: 'Training Programs',  group: 'Reports'     },
]

const groups = ['Overview', 'Management', 'Reports']

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Session ended securely')
    navigate('/login/admin')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-[#05080f] border-r border-slate-800/80
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/80
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/60">
          <Zap size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none">EduNexus</p>
            <p className="text-blue-400 text-[10px] mt-0.5 leading-none font-semibold uppercase tracking-wider">
              Super Admin Panel
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

      {/* Security badge */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
          <ShieldCheck size={13} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-blue-400 text-xs font-semibold">Secure Admin Session</p>
            <p className="text-slate-600 text-[10px]">Full platform access</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group)
          return (
            <div key={group}>
              {(!collapsed || mobile) && (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-1 mb-1">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label }) => (
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
                    {(!collapsed || mobile) && <span>{label}</span>}
                    {collapsed && !mobile && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-xl
                        opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none
                        border border-slate-700 shadow-xl">
                        {label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800/80">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">{user?.email}</p>
              <p className="text-blue-400 text-[10px]">Super Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <LogOut size={17} />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#030608] relative">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0 relative z-10">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="h-14 bg-[#05080f]/95 border-b border-slate-800/80 flex items-center px-4 gap-4 flex-shrink-0 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-300">
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 text-sm font-semibold">EduNexus Super Admin</span>
          </div>

          <div className="flex-1" />

          {/* System status */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/40 px-3 py-1.5 rounded-lg text-xs">
            <Activity size={11} className="text-green-400" />
            <span className="text-slate-400">All systems operational</span>
          </div>

          {/* Notifications */}
          <button className="relative text-slate-500 hover:text-slate-300 transition-colors p-1.5">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
          </button>

          {/* Profile */}
          <div className="pl-2 border-l border-slate-800">
            <ProfileDropdown theme="dark" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#030608] p-4 md:p-6 dark-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
