import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, CheckCircle, Users, Building2, GraduationCap,
  Zap, ArrowRight, ArrowLeft, RefreshCw, BookOpen,
} from 'lucide-react'

// ── Role configuration ────────────────────────────────────────────────────────
const roleConfig = {
  student: {
    icon: Users,
    label: 'Student',
    desc: 'Find internships, jobs and build your career',
    gradient: 'from-violet-600 to-indigo-600',
    dashboard: '/student/dashboard',
  },
  company: {
    icon: Building2,
    label: 'Company',
    desc: 'Post jobs and find skilled candidates',
    gradient: 'from-emerald-600 to-teal-600',
    dashboard: '/company/dashboard',
  },
  college: {
    icon: GraduationCap,
    label: 'College',
    desc: 'Manage students and track placements',
    gradient: 'from-blue-600 to-indigo-600',
    dashboard: '/admin/dashboard',
  },
  advisor: {
    icon: BookOpen,
    label: 'Advisor',
    desc: 'Guide students through the admissions journey',
    gradient: 'from-rose-600 to-pink-600',
    dashboard: '/advisor/dashboard',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRegisterFn(role) {
  return {
    student: authAPI.registerStudent,
    company: authAPI.registerCompany,
    college: authAPI.registerCollege,
    advisor: authAPI.registerAdvisor,
  }[role]
}

export default function Register() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginFromTokens } = useAuth()

  const [role, setRole]       = useState(searchParams.get('role') || 'student')
  const [step, setStep]       = useState(1)   // 1 = credentials, 2 = OTP
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm]       = useState({ email: '', password: '', confirm_password: '' })
  const [otp, setOtp]         = useState('')

  const cfg  = roleConfig[role]
  const Icon = cfg.icon
  const loginPath = `/login/${role}`

  // ── Step 1: Register ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await getRegisterFn(role)(form)
      toast.success(`OTP sent to ${form.email}`)
      setStep(2)
    } catch (err) {
      const errs = err.response?.data
      if (errs && typeof errs === 'object') {
        Object.values(errs).flat().forEach(msg => toast.error(String(msg)))
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter a 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await authAPI.verifyOTP(form.email, otp)
      const data = res.data

      if (data.pending_approval) {
        // Company: OTP verified but awaiting admin approval
        toast.success('Email verified! Your account is pending admin approval.')
        navigate('/portal')
        return
      }

      // Student / College: backend returns JWT tokens — auto-login directly
      if (data.access && data.user) {
        loginFromTokens(data.access, data.refresh, data.user)
        toast.success('Email verified! Welcome to EduNexus 🎉')
        navigate(cfg.dashboard)
      } else {
        toast.success('Verified! Please log in.')
        navigate(loginPath)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true)
    try {
      await authAPI.sendOTP(form.email)
      toast.success('New OTP sent to your email!')
      setOtp('')
    } catch {
      toast.error('Could not resend OTP. Please try again.')
    } finally {
      setResending(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none">EduNexus</p>
            <p className="text-blue-300 text-xs leading-none mt-0.5">Academia Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ── Step 1: Credentials ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm mb-6">Join EduNexus as a {cfg.label}</p>

              {/* Role selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {Object.entries(roleConfig).map(([key, { icon: RIcon, label }]) => (
                  <button key={key} type="button" onClick={() => setRole(key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
                      ${role === key
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}>
                    <RIcon size={18} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Role description */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl mb-5 text-sm text-gray-600 border border-gray-100">
                <Icon size={15} className="mt-0.5 flex-shrink-0 text-violet-600" />
                <span>{cfg.desc}</span>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" className="input"
                    placeholder={
                      role === 'student' ? 'you@student.in' :
                      role === 'company' ? 'hr@company.com' :
                      role === 'advisor' ? 'advisor@acadmissions.in' : 'admin@college.edu.in'
                    }
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required />
                </div>

                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} className="input pr-11"
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className="input"
                    placeholder="Repeat password"
                    value={form.confirm_password}
                    onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                    required />
                </div>

                {/* Company notice */}
                {role === 'company' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
                    <span>
                      Company accounts require <strong>admin approval</strong> after OTP
                      verification before you can log in.
                    </span>
                  </div>
                )}

                {/* Password strength */}
                {form.password && (
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all
                          ${form.password.length >= i * 2
                            ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-yellow-400' : 'bg-green-400'
                            : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.password.length < 4 ? 'Too short' :
                       form.password.length < 6 ? 'Weak' :
                       form.password.length < 8 ? 'Fair' : 'Strong ✓'}
                    </p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full bg-gradient-to-r ${cfg.gradient} text-white font-bold py-3.5 rounded-xl
                    flex items-center justify-center gap-2 text-sm transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:transform-none`}>
                  {loading
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Creating account...</>
                    : <>Create {cfg.label} Account <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{' '}
                <Link to={loginPath} className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                  Sign in
                </Link>
              </p>

              <p className="text-center mt-3">
                <Link to="/portal" className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft size={11} /> Back to portal selection
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: OTP Verification (all roles) ─────────────────────── */}
          {step === 2 && (
            <div className="p-8 text-center">
              {/* Role-coloured icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="text-3xl">📧</span>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                Verify Your Email
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                A 6-digit OTP was sent to:
              </p>
              <p className="font-semibold text-gray-800 text-sm bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 inline-block mb-5">
                {form.email}
              </p>

              {/* Company extra note */}
              {role === 'company' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left mb-5 flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0">⚠️</span>
                  <span>
                    After verifying your email your account will be reviewed by an admin
                    before you can log in.
                  </span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-4 max-w-xs mx-auto">
                {/* 6-box OTP visual */}
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input text-center text-3xl font-mono tracking-[0.5em] py-4 w-full"
                    placeholder="——————"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Enter the 6-digit code from your email</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`w-full bg-gradient-to-r ${cfg.gradient} text-white font-bold py-3.5 rounded-xl
                    flex items-center justify-center gap-2 text-sm transition-all
                    hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:transform-none`}>
                  {loading
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Verifying...</>
                    : <><CheckCircle size={16} /> Verify OTP</>}
                </button>
              </form>

              {/* Resend */}
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : "Didn't receive? Resend OTP"}
              </button>

              {/* Back link */}
              <button
                type="button"
                onClick={() => { setStep(1); setOtp('') }}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                <ArrowLeft size={11} /> Change email or role
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 EduNexus Academia Portal
        </p>
      </div>
    </div>
  )
}
