import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  BookOpen, Eye, EyeOff, Lock, Mail, ArrowLeft,
  ClipboardList, Users, BarChart3, FileCheck, AlertTriangle,
} from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const features = [
  { icon: Users,         label: 'Application Tracking',  desc: 'Monitor every student application'  },
  { icon: ClipboardList, label: 'Counselling Pipeline',  desc: 'Manage sessions and follow-ups'      },
  { icon: BarChart3,     label: 'Admission Analytics',   desc: 'Conversion rates and yield data'     },
  { icon: FileCheck,     label: 'Document Verification', desc: 'Review and approve student docs'     },
]

export default function AdvisorLogin() {
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
      if (user.role !== 'advisor') {
        await logout()
        toast.error('Access denied. This portal is for admissions advisors only.')
        return
      }
      toast.success('Welcome to the Acadmissions Portal!')
      navigate('/advisor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid advisor credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d060e] flex flex-col lg:flex-row">

      {/* LEFT — Feature Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-gradient-to-b from-[#1a0820] to-[#0d060e] border-r border-rose-900/40 p-10 flex-shrink-0">
        <div>
          <Link to="/portal" className="flex items-center gap-2 mb-14">
            <EduNexusLogo size={32} />
          </Link>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
                  <BookOpen size={38} className="text-rose-400" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-sm">🎯</span>
              </div>
            </div>
          </div>

          <h2 className="text-white text-xl font-bold text-center mb-2">Acadmissions Portal</h2>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-10">
            Guide students through every step of their admissions journey — from application to enrolment.
          </p>

          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-rose-950/30 border border-rose-900/30 rounded-xl p-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{label}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { val: '—', label: 'Advisors Active'    },
            { val: '—', label: 'Applications Filed' },
            { val: '—', label: 'Students Enrolled'  },
            { val: '—', label: 'Docs Verified'      },
          ].map(({ val, label }) => (
            <div key={label} className="bg-rose-950/30 border border-rose-900/30 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-rose-400">{val}</p>
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
              <BookOpen size={18} className="text-rose-400" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Admissions Advisor Login</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Advisor Access</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to the EduNexus Acadmissions Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Advisor Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input type="email"
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-rose-500
                    focus:ring-1 focus:ring-rose-500/40 transition-all"
                  placeholder="advisor@acadmissions.in"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'}
                  className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600
                    rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-rose-500
                    focus:ring-1 focus:ring-rose-500/40 transition-all"
                  placeholder="••••••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-rose-400 hover:text-rose-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500
                disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2
                text-sm transition-all duration-200 shadow-lg shadow-rose-900/30">
              {loading
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Authenticating...</>
                : <><BookOpen size={17} /> Sign In to Acadmissions Portal</>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">New to Acadmissions?</span>
            </div>
            <p className="text-xs text-slate-500">
              No account yet?{' '}
              <Link to="/register?role=advisor" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                Register as an Admissions Advisor →
              </Link>
            </p>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            © 2024 EduNexus Acadmissions Portal · Secure Advisor Access
          </p>
        </div>
      </div>
    </div>
  )
}
