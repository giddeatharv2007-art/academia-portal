import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileDropdown from '../components/common/ProfileDropdown'
import CursorAnimation from '../components/common/CursorAnimation'
import {
  LayoutDashboard, Building2, PlusCircle, Briefcase, GraduationCap,
  Users, FileText, Zap, Bell, LogOut, ChevronLeft, ChevronRight, Menu,
  BarChart3, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/company/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/company/profile',      icon: Building2,       label: 'Company Profile' },
      { to: '/company/notifications',icon: Bell,            label: 'Notifications' },
    ]
  },
  {
    label: 'Post Opportunities',
    items: [
      { to: '/company/post-job',         icon: PlusCircle,   label: 'Post a Job' },
      { to: '/company/post-internship',  icon: PlusCircle,   label: 'Post Internship' },
      { to: '/company/challenges/create',icon: Zap,          label: 'Create Challenge' },
    ]
  },
  {
    label: 'Manage',
    items: [
      { to: '/company/jobs',         icon: Briefcase,        label: 'Manage Jobs' },
      { to: '/company/internships',  icon: GraduationCap,    label: 'Manage Internships' },
      { to: '/company/challenges',   icon: Zap,              label: 'Challenges' },
      { to: '/company/applications', icon: FileText,         label: 'Applications' },
    ]
  },
  {
    label: 'Talent',
    items: [
      { to: '/company/candidates',   icon: Users,            label: 'Find Candidates' },
    ]
  },
]

export default function CompanyLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login/company')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 border-r border-slate-800
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-900/50">
          <Building2 size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="font-extrabold text-white text-sm leading-none">EduNexus</p>
            <p className="text-emerald-400 text-xs mt-0.5 leading-none font-medium">Recruiter Portal</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-600 hover:text-emerald-400 transition-colors hidden lg:block flex-shrink-0">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Verified badge */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
          <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-400 text-xs font-medium">Verified Company Account</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-3 py-1 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    } ${collapsed && !mobile ? 'justify-center' : ''}`
                  }
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {(!collapsed || mobile) && <span>{label}</span>}
                  {collapsed && !mobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-600">
                      {label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-300 text-xs font-medium truncate">{user?.email}</p>
              <p className="text-slate-600 text-xs">Company Account</p>
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
    <div className="flex h-screen overflow-hidden bg-slate-950 relative">
      <div className="hidden lg:flex flex-col flex-shrink-0"><Sidebar /></div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500">
            <Menu size={20} />
          </button>
          <div className="flex-1" />

          <NavLink to="/company/post-job"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-400
              bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
            <PlusCircle size={13} /> Post Job
          </NavLink>

          <NavLink to="/company/candidates"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400
              bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
            <Users size={13} /> Find Talent
          </NavLink>

          <button className="relative text-slate-500 hover:text-slate-300 transition-colors p-1.5">
            <Bell size={18} />
          </button>

          <div className="pl-2 border-l border-slate-800">
            <ProfileDropdown theme="dark" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
