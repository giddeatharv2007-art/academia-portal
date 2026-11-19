import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatBot from '../components/common/ChatBot'
import ProfileDropdown from '../components/common/ProfileDropdown'
import ProfileCompletionGuard from '../components/common/ProfileCompletionGuard'
import {
  LayoutDashboard, User, Award, Target, Map, Briefcase,
  GraduationCap, FileText, Video, Zap, Trophy, Bell,
  LogOut, ChevronLeft, ChevronRight, Menu, Sparkles, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationsAPI } from '../services/api'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/student/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/student/profile',      icon: User,            label: 'My Profile' },
      { to: '/student/notifications',icon: Bell,            label: 'Notifications', badge: true },
    ]
  },
  {
    label: 'Career Tools',
    items: [
      { to: '/student/skill-passport', icon: Award,          label: 'Skill Passport' },
      { to: '/student/skill-gap',      icon: Target,         label: 'Skill Gap' },
      { to: '/student/roadmap',        icon: Map,            label: 'Learning Roadmap' },
      { to: '/student/interview',      icon: Video,          label: 'AI Interview' },
    ]
  },
  {
    label: 'Opportunities',
    items: [
      { to: '/student/jobs',         icon: Briefcase,       label: 'Jobs' },
      { to: '/student/internships',  icon: GraduationCap,   label: 'Internships' },
      { to: '/student/challenges',   icon: Zap,             label: 'Challenges' },
      { to: '/student/applications', icon: FileText,        label: 'Applications' },
    ]
  },
  {
    label: 'Achievements',
    items: [
      { to: '/student/badges',       icon: Trophy,          label: 'Badges' },
    ]
  },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationsAPI.list()
      .then(res => setUnread(res.data.unread_count || 0))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('See you soon! 👋')
    navigate('/login/student')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white border-r border-violet-100
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-violet-100
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
          <Sparkles size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 text-sm leading-none">EduNexus</p>
            <p className="text-violet-500 text-xs mt-0.5 leading-none font-medium">Student Portal</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-300 hover:text-violet-500 transition-colors hidden lg:block flex-shrink-0">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest px-3 py-1 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink key={to} to={to}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                      : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
                    } ${collapsed && !mobile ? 'justify-center' : ''}`
                  }
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {(!collapsed || mobile) && (
                    <>
                      <span className="flex-1">{label}</span>
                      {badge && unread > 0 && (
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !mobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Job Readiness teaser */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={13} className="text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">Job Readiness</span>
          </div>
          <div className="w-full bg-violet-100 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-1.5 rounded-full w-3/4" />
          </div>
          <p className="text-xs text-violet-500 mt-1.5">75% complete · Keep going! 🚀</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-violet-100">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <p className="text-gray-600 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200
            ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <LogOut size={17} />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-violet-50/30 relative">
      <div className="hidden lg:flex flex-col flex-shrink-0"><Sidebar /></div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-violet-100 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-400">
            <Menu size={20} />
          </button>
          <div className="flex-1" />

          {/* Quick links */}
          <NavLink to="/student/interview"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
            <Video size={13} /> AI Interview
          </NavLink>

          <NavLink to="/student/notifications" className="relative text-gray-400 hover:text-violet-600 transition-colors p-1.5">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>

          <div className="pl-2 border-l border-violet-100">
            <ProfileDropdown theme="light" />
          </div>        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-violet-50/40 via-white to-indigo-50/30 p-4 md:p-6">
          <ProfileCompletionGuard>
            <Outlet />
          </ProfileCompletionGuard>
        </main>
      </div>
      <ChatBot />
    </div>
  )
}
