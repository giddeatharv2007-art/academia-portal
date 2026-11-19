import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Building2, Eye, EyeOff, Mail, Lock, ArrowLeft,
  ArrowRight, Users, BarChart3, Target, CheckCircle
} from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const stats = [
  { value: '10,000+', label: 'Verified Students' },
  { value: '500+', label: 'Active Companies' },
  { value: '3,000+', label: 'Successful Placements' },
  { value: '95%', label: 'Recruiter Satisfaction' },
]

const features = [
  { icon: Users, label: 'AI Candidate Matching', desc: 'Find the best fit instantly' },
  { icon: Target, label: 'Skill-Based Filtering', desc: 'Filter by verified skills' },
  { icon: BarChart3, label: 'Recruitment Analytics', desc: 'Data-driven hiring decisions' },
  { icon: CheckCircle, label: 'Verified Profiles', desc: 'College-backed credentials' },
]

export default function CompanyLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'company') {
        toast.error('Please use the Company Portal to login as a recruiter.')
        return
      }
      toast.success('Welcome to your Recruiter Dashboard!')
      navigate('/company/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid company credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">

      {/* LEFT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white border-r border-gray-100">
        <div className="w-full max-w-md">

          {/* Back */}
          <Link to="/portal" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to Portal Selection
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <EduNexusLogo size={38} darkText={true} />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your EduNexus Recruiter Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="email"
                  className="w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
                    rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500 
                    focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                  placeholder="hr@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
                    rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-emerald-500 
                    focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 
                disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 
                text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              {loading
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Signing in...</>
                : <><Building2 size={17} /> Sign In to Recruiter Portal <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-sm text-gray-600 mb-1 font-medium">New to EduNexus for Business?</p>
            <p className="text-xs text-gray-500 mb-3">Register your company and start finding top talent today.</p>
            <Link to="/register?role=company"
              className="block w-full text-center border-2 border-emerald-500 text-emerald-700 font-semibold 
                py-2.5 rounded-xl text-sm hover:bg-emerald-500 hover:text-white transition-all duration-200">
              Register Your Company →
            </Link>
          </div>

          {/* Demo */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">Demo Company Accounts:</p>
            <div className="space-y-1">
              {[
                { email: 'company1@gmail.com', label: 'TechWave Solutions'    },
                { email: 'company2@gmail.com', label: 'DataBridge Analytics'  },
                { email: 'company3@gmail.com', label: 'CloudNexus Technologies'},
                { email: 'company4@gmail.com', label: 'FinEdge Systems'        },
                { email: 'company5@gmail.com', label: 'EduLearn Platform'      },
              ].map(({ email, label }) => (
                <button key={email} type="button"
                  onClick={() => setForm({ email, password: 'Company@123' })}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex justify-between group"
                >
                  <span className="font-mono text-gray-600 group-hover:text-emerald-700">{email}</span>
                  <span className="text-gray-400 group-hover:text-emerald-600 text-[10px]">{label} →</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Password for all: <span className="font-mono text-gray-500">Company@123</span></p>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            © 2024 EduNexus · Trusted by 500+ companies
          </p>
        </div>
      </div>

      {/* RIGHT — Corporate Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-10 flex-shrink-0 relative overflow-hidden">

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          <div className="mb-10">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">EduNexus for Business</span>
            <h2 className="text-white text-2xl font-extrabold mt-2 mb-2">Hire Smarter.</h2>
            <h2 className="text-emerald-400 text-2xl font-extrabold mb-3">Hire Faster. 🏢</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Access India's most skill-verified student talent pool with AI-powered matching and real credential verification.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-10">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
