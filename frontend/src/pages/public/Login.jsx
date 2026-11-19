import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const DEMO_ACCOUNTS = [
  { role: 'Student',  email: 'ajaymali0885@gmail.com',       pwd: 'Student@123' },
  { role: 'Student',  email: 'atharvgidde2007@gmail.com',     pwd: 'Student@123' },
  { role: 'Company',  email: 'company1@gmail.com',            pwd: 'Company@123' },
  { role: 'College',  email: 'admin@sknpandharpur.edu.in',    pwd: 'College@123' },
  { role: 'Admin',    email: 'admin@edunexus.in',             pwd: 'Admin@123'   },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success('Welcome back!')
      const next = searchParams.get('next')
      if (next) { navigate(next); return }
      if (user.role === 'student')       navigate('/student/dashboard')
      else if (user.role === 'company')  navigate('/company/dashboard')
      else                               navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email, pwd) => {
    setForm({ email, password: pwd })
    toast.success('Demo credentials filled!', { duration: 1500 })
  }

  const roleColor = {
    Student: 'text-indigo-600 bg-indigo-50',
    Company: 'text-emerald-600 bg-emerald-50',
    College: 'text-violet-600 bg-violet-50',
    Admin:   'text-rose-600 bg-rose-50',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-indigo-600 opacity-10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-violet-600 opacity-10 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-800 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <EduNexusLogo size={52} showTagline={true} className="justify-center" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-950/40 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5">
            <h2 className="text-white font-bold text-xl">Welcome back 👋</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Sign in to your EduNexus account</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email" className="input" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required autoFocus
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} className="input pr-11"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                {loading
                  ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <LogIn size={18} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>

            {/* Demo Logins */}
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                <Sparkles size={12} className="text-indigo-400" /> Quick Demo Logins
              </p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map(({ role, email, pwd }) => (
                  <button
                    key={email} type="button"
                    onClick={() => fillDemo(email, pwd)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-all group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleColor[role]}`}>
                        {role}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">{email}</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                      Fill →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} EduNexus. All rights reserved.
        </p>
      </div>
    </div>
  )
}
