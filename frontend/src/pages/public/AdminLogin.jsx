import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowLeft,
  Activity, AlertTriangle, CheckCircle, Zap
} from 'lucide-react'

export default function AdminLogin() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        await logout()
        toast.error('Access denied. This portal is for EduNexus super admins only.')
        if (user.role === 'college') toast('Use the College Portal to sign in.', { icon: '🏛️' })
        return
      }
      toast.success('Welcome, Administrator!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col lg:flex-row">

      {/* LEFT — Security Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-gradient-to-b from-slate-900 to-[#060a14] border-r border-slate-800 p-10 flex-shrink-0">
        <div>
          {/* Logo */}
          <Link to="/portal" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none block">EduNexus</span>
              <span className="text-blue-400 text-xs leading-none">Admin Portal</span>
            </div>
          </Link>

          {/* Shield animation */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 pulse-ring">
                <div className="w-20 h-20 rounded-full bg-blue-500/15 flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck size={40} className="text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-white text-xl font-bold text-center mb-2">Secure Admin Portal</h2>
          <p className="text-slate-400 text-sm text-center mb-10">
            Enterprise-grade security for platform administrators
          </p>

          {/* Security indicators */}
          <div className="space-y-3">
            {[
              { text: 'SSL/TLS Encrypted Connection'    },
              { text: 'JWT Token Authentication'         },
              { text: 'Role-Based Access Control'        },
              { text: 'Session Activity Monitoring'      },
            ].map(({ text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                <span className="text-slate-400">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Login Activity</span>
          </div>
          <div className="space-y-2">
            {[
              { time: 'Today 09:14', text: 'Admin session started',  dot: 'bg-green-400'  },
              { time: 'Today 08:02', text: 'Company verified',       dot: 'bg-blue-400'   },
              { time: 'Yesterday',   text: 'Bulk data export',       dot: 'bg-yellow-400' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
                <span className="flex-1 truncate">{a.text}</span>
                <span className="text-slate-600 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Back button */}
          <Link to="/portal" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to Portal Selection
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Secure Admin Login</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Administrator Access</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to the EduNexus admin control panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="email"
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500
                    focus:ring-1 focus:ring-blue-500/40 transition-all"
                  placeholder="admin@academiaportal.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500
                    focus:ring-1 focus:ring-blue-500/40 transition-all"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
                  checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} />
                <span className="text-sm text-slate-400">Remember this device</span>
              </label>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold
                py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/40
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-lg shadow-blue-900/30
                disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Authenticating...</>
              ) : (
                <><ShieldCheck size={17} /> Secure Login</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">Demo Super Admin Credentials</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Email: <span className="text-slate-300 font-mono">admin@academiaportal.in</span></p>
              <p>Password: <span className="text-slate-300 font-mono">Admin@123</span></p>
              <p className="text-slate-600 mt-2 text-[11px]">
                For college admin access, use the <span className="text-blue-400">College Portal</span> instead.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            © 2024 EduNexus Admin Portal · All access is logged and monitored
          </p>
        </div>
      </div>
    </div>
  )
}
