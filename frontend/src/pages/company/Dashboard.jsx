import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  Briefcase, GraduationCap, Users, FileText, CheckCircle,
  AlertCircle, PlusCircle, Search, TrendingUp, Zap,
  ArrowRight, Clock, BarChart3, Building2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const pipelineData = [
  { stage: 'Applied',    count: 48 },
  { stage: 'Reviewed',   count: 31 },
  { stage: 'Shortlisted',count: 18 },
  { stage: 'Interview',  count: 9  },
  { stage: 'Selected',   count: 5  },
]

function EmeraldStatCard({ title, value, icon: Icon, subtitle, trend }) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
          <Icon size={18} className="text-emerald-400" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-white mb-0.5">{value ?? '—'}</p>
      <p className="text-slate-500 text-xs font-medium">{title}</p>
      {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companiesAPI.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
    </div>
  )

  if (!stats?.is_verified) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pending Verification</h2>
          <p className="text-slate-400 text-sm mb-4">
            Your company registration is under review. Once approved by the admin,
            you'll have full access to post jobs and find candidates.
          </p>
          <span className="inline-block bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold px-4 py-2 rounded-full capitalize">
            Status: {stats?.verification_status}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Recruiter Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Recruitment Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/company/post-job"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <PlusCircle size={15} /> Post Job
          </Link>
          <Link to="/company/candidates"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-700">
            <Search size={15} /> Find Talent
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <EmeraldStatCard title="Active Jobs"         value={stats?.active_jobs}         icon={Briefcase}    trend={5}  />
        <EmeraldStatCard title="Active Internships"  value={stats?.active_internships}  icon={GraduationCap}           />
        <EmeraldStatCard title="Active Challenges"   value={stats?.active_challenges}   icon={Zap}                     />
        <EmeraldStatCard title="Total Applications"  value={stats?.total_applications}  icon={FileText}     trend={12} />
        <EmeraldStatCard title="Shortlisted"         value={stats?.shortlisted}         icon={TrendingUp}              />
        <EmeraldStatCard title="Selected"            value={stats?.selected}            icon={CheckCircle}             />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recruitment pipeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" /> Recruitment Pipeline
            </h2>
            <Link to="/company/applications" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-emerald-400" /> Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { to: '/company/post-job',          label: 'Post a New Job',         icon: Briefcase,     color: 'text-blue-400',   bg: 'bg-blue-500/10'    },
              { to: '/company/post-internship',   label: 'Post Internship',        icon: GraduationCap, color: 'text-violet-400', bg: 'bg-violet-500/10'  },
              { to: '/company/candidates',        label: 'Find Candidates',        icon: Search,        color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
              { to: '/company/challenges/create', label: 'Create Challenge',       icon: Zap,           color: 'text-yellow-400', bg: 'bg-yellow-500/10'  },
              { to: '/company/applications',      label: 'Review Applications',   icon: FileText,      color: 'text-slate-400',  bg: 'bg-slate-700'      },
            ].map(({ to, label, icon: Icon, color, bg }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-colors group">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-slate-300 text-sm flex-1">{label}</span>
                <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-emerald-400" /> Recent Recruitment Activity
        </h2>
        <div className="space-y-0">
          {[
            { msg: 'Arjun Sharma applied for Python Developer Internship',      time: '5 min ago',  status: 'new',        dot: 'bg-blue-400'    },
            { msg: 'Priya Patil shortlisted for Data Scientist role',           time: '1 hr ago',   status: 'shortlisted',dot: 'bg-purple-400'  },
            { msg: 'Team Alpha submitted solution to AI Challenge',             time: '2 hr ago',   status: 'submission', dot: 'bg-yellow-400'  },
            { msg: 'Kavya Nair selected for Backend Developer position',        time: '3 hr ago',   status: 'selected',   dot: 'bg-emerald-400' },
            { msg: 'Rohan Mehta completed AI interview — Score: 79/100',       time: 'Yesterday',  status: 'interview',  dot: 'bg-teal-400'    },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
              <span className="text-slate-300 text-sm flex-1">{a.msg}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-slate-600 text-xs">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
