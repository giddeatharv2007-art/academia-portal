import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  GraduationCap, Eye, EyeOff, Mail, Lock,
  ArrowLeft, ArrowRight, Target, Award, TrendingUp, Briefcase
} from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const highlights = [
  { icon: Briefcase, label: 'Jobs & Internships', desc: '500+ opportunities waiting' },
  { icon: Target, label: 'Skill Gap Analysis', desc: 'Know exactly what to learn' },
  { icon: Award, label: 'Verified Skill Passport', desc: 'College-backed credentials' },
  { icon: TrendingUp, label: 'AI Career Roadmap', desc: 'Personalized learning path' },
]

export default function StudentLogin() {
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
      if (user.role !== 'student') {
        toast.error('Please use the Student Portal to login as a student.')
        return
      }
      toast.success(`Welcome back! 🎓`)
      navigate('/student/dashboard')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.detail || data?.non_field_errors?.[0] || data?.email?.[0] || 'Invalid email or password'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex flex-col lg:flex-row">

      {/* LEFT — Visual Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-10 flex-shrink-0 relative overflow-hidden">

        {/* Background patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/portal" className="flex items-center gap-2 mb-16">
            <EduNexusLogo size={32} />
          </Link>

          {/* Central illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <GraduationCap size={52} className="text-white" />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-lg">🏅</span>
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </div>

          <h2 className="text-white text-2xl font-extrabold text-center mb-2">Your Career Journey</h2>
          <h2 className="text-white text-2xl font-extrabold text-center mb-3">Starts Here 🚀</h2>
          <p className="text-violet-200 text-sm text-center mb-10">
            Join 10,000+ students who found their dream internship and job through EduNexus
          </p>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-3">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-violet-300 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Back */}
          <Link to="/portal" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to Portal Selection
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
              <GraduationCap size={26} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue your career journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="email"
                  className="w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
                    rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-violet-500 
                    focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm"
                  placeholder="your@email.com"
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
                    rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-violet-500 
                    focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm"
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
              <button type="button" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 
                disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 
                text-sm transition-all duration-200 shadow-lg shadow-violet-500/30"
            >
              {loading
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Signing in...</>
                : <><GraduationCap size={17} /> Sign In to Student Portal <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
            <p className="text-sm text-gray-600 text-center mb-3">New to EduNexus?</p>
            <Link to="/register?role=student"
              className="block w-full text-center border-2 border-violet-500 text-violet-700 font-semibold 
                py-2.5 rounded-xl text-sm hover:bg-violet-500 hover:text-white transition-all duration-200">
              Create Student Account ✨
            </Link>
          </div>

          {/* Demo */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">Quick Demo Accounts:</p>
            <div className="space-y-1">
              {[
                { email: 'ajaymali0885@gmail.com',   pwd: 'Student@123' },
                { email: 'atharvgidde2007@gmail.com', pwd: 'Student@123' },
                { email: 'shreyashkashid@gmail.com',  pwd: 'Student@123' },
                { email: 'prathmesh07@gmail.com',     pwd: 'Student@123' },
              ].map(({ email, pwd }) => (
                <button key={email} type="button"
                  onClick={() => setForm({ email, password: pwd })}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors flex justify-between group"
                >
                  <span className="font-mono text-gray-600 group-hover:text-violet-600">{email}</span>
                  <span className="text-gray-400 group-hover:text-violet-500">Fill →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
