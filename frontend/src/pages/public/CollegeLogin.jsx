import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowLeft,
  BarChart3, Users, GraduationCap, BookOpen, AlertTriangle
} from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const features = [
  { icon: Users,        label: 'Student Management',    desc: 'Add, verify and track students' },
  { icon: BarChart3,    label: 'Industry Analytics',    desc: 'Skill demand vs availability'   },
  { icon: GraduationCap,label: 'Training Programs',     desc: 'Create gap-based training'      },
  { icon: BookOpen,     label: 'Education Verification',desc: 'Verify student certificates'    },
]

export default function CollegeLogin() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'college') {
        await logout()
        toast.error('Access denied. This portal is for college administrators only.')
        return
      }
      toast.success('Welcome to the College Admin Portal!')
      navigate('/college/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid college credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col lg:flex-row">

      {/* LEFT — Feature Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-gradient-to-b from-[#0d1528] to-[#060a14] border-r border-slate-800 p-10 flex-shrink-0">
        <div>
          <Link to="/portal" className="flex items-center gap-2 mb-14">
            <EduNexusLogo size={32} />
          </Link>

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <ShieldCheck size={38} className="text-blue-400" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-sm">🏛️</span>
              </div>
            </div>
          </div>

          <h2 className="text-white text-xl font-bold text-center mb-2">College Admin Portal</h2>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-10">
            Manage your institution's placement activities, track student progress and bridge the industry skill gap.
          </p>

          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{label}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: '2', label: 'Colleges Registered' },
            { val: '10+', label: 'Students Enrolled' },
            { val: '5', label: 'Companies Tied Up' },
            { val: '100%', label: 'Data Verified' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-blue-400">{val}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/portal" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to Portal Selection
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">College Admin Login</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Institution Access</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to the EduNexus College Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                College Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input type="email"
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500
                    focus:ring-1 focus:ring-blue-500/40 transition-all"
                  placeholder="admin@college.edu.in"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'}
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500
                    focus:ring-1 focus:ring-blue-500/40 transition-all"
                  placeholder="••••••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2
                text-sm transition-all duration-200 shadow-lg shadow-blue-900/30
                focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              {loading
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Authenticating...</>
                : <><ShieldCheck size={17} /> Sign In to College Portal</>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">Demo Credentials</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>SKN Pandharpur: <span className="text-slate-300 font-mono">admin@sknpandharpur.edu.in</span> / <span className="text-slate-300 font-mono">College@123</span></p>
              <p>SKN Pune: <span className="text-slate-300 font-mono">admin@sknpune.edu.in</span> / <span className="text-slate-300 font-mono">College@123</span></p>
            </div>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            © 2024 EduNexus College Portal · Secure Institution Access
          </p>
        </div>
      </div>
    </div>
  )
}
