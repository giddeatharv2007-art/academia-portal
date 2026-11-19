import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  User, Edit, LogOut, Settings, ChevronDown,
  CheckCircle, Shield, Building2, GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'

const roleConfig = {
  student: {
    icon: GraduationCap,
    color: 'from-violet-500 to-indigo-500',
    label: 'Student',
    loginPath: '/login/student',
    profilePath: '/student/profile',
    editPath: '/student/profile/edit',
  },
  company: {
    icon: Building2,
    color: 'from-emerald-500 to-teal-500',
    label: 'Company',
    loginPath: '/login/company',
    profilePath: '/company/profile',
    editPath: '/company/profile',
  },
  college: {
    icon: Shield,
    color: 'from-blue-500 to-indigo-500',
    label: 'College Admin',
    loginPath: '/login/college',
    profilePath: '/admin/dashboard',
    editPath: '/admin/dashboard',
  },
  admin: {
    icon: Shield,
    color: 'from-blue-500 to-indigo-600',
    label: 'Admin',
    loginPath: '/login/college',
    profilePath: '/admin/dashboard',
    editPath: '/admin/dashboard',
  },
}

export default function ProfileDropdown({ theme = 'light' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const cfg = roleConfig[user?.role] || roleConfig.student
  const RoleIcon = cfg.icon

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    toast.success('Signed out successfully')
    navigate(cfg.loginPath)
  }

  const initials = user?.email?.[0]?.toUpperCase() || '?'

  const isDark = theme === 'dark'

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all duration-200 group
          ${isDark
            ? 'hover:bg-white/10 text-slate-300'
            : 'hover:bg-violet-50 text-gray-700'}`}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.color}
          flex items-center justify-center shadow-sm flex-shrink-0 ring-2
          ${isDark ? 'ring-white/10 group-hover:ring-white/20' : 'ring-violet-100 group-hover:ring-violet-200'}
          transition-all`}>
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>

        {/* Email */}
        <div className="hidden sm:block text-left min-w-0">
          <p className={`text-xs font-semibold leading-none truncate max-w-[120px]
            ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
            {user?.email?.split('@')[0] || 'User'}
          </p>
          <p className={`text-[10px] leading-none mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            {cfg.label}
          </p>
        </div>

        <ChevronDown size={13} className={`flex-shrink-0 transition-transform duration-200
          ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border z-50
          overflow-hidden animate-fade-in
          ${isDark
            ? 'bg-slate-900 border-slate-700/60 shadow-black/40'
            : 'bg-white border-gray-100 shadow-gray-200/80'}`}>

          {/* User info header */}
          <div className={`px-4 py-4 ${isDark ? 'bg-slate-800/60' : 'bg-gradient-to-br from-violet-50 to-indigo-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.color}
                flex items-center justify-center shadow-md flex-shrink-0`}>
                <span className="text-white font-bold">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <RoleIcon size={10} className={isDark ? 'text-blue-400' : 'text-violet-600'} />
                  <span className={`text-[10px] font-semibold ${isDark ? 'text-blue-400' : 'text-violet-600'}`}>
                    {cfg.label}
                  </span>
                  {user?.is_email_verified && (
                    <CheckCircle size={10} className="text-green-500 ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`} />

          {/* Menu items */}
          <div className="p-1.5">
            <Link to={cfg.profilePath}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors group
                ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDark ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-violet-100 group-hover:bg-violet-200'}`}>
                <User size={14} className={isDark ? 'text-slate-300' : 'text-violet-600'} />
              </div>
              <span>View Profile</span>
            </Link>

            <Link to={cfg.editPath}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors group
                ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDark ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-violet-100 group-hover:bg-violet-200'}`}>
                <Edit size={14} className={isDark ? 'text-slate-300' : 'text-violet-600'} />
              </div>
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Divider */}
          <div className={`h-px mx-3 ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`} />

          {/* Logout */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors group text-red-500
                ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                <LogOut size={14} className="text-red-500" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
