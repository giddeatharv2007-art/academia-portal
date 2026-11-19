import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  Users, Building2, Briefcase, GraduationCap, FileText,
  Trophy, Video, CheckCircle, AlertCircle, ShieldCheck,
  TrendingUp, Activity, ArrowRight, BarChart3, Zap, Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import CollegeDashboard from './CollegeDashboard'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const activityData = [
  { day: 'Mon', applications: 12, verifications: 3 },
  { day: 'Tue', applications: 19, verifications: 5 },
  { day: 'Wed', applications: 15, verifications: 2 },
  { day: 'Thu', applications: 28, verifications: 7 },
  { day: 'Fri', applications: 22, verifications: 4 },
  { day: 'Sat', applications: 10, verifications: 1 },
  { day: 'Sun', applications: 8,  verifications: 2 },
]

function DarkStatCard({ title, value, icon: Icon, color, change, subtitle }) {
  const colors = {
    blue:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   val: 'text-blue-300' },
    green:   { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  val: 'text-green-300' },
    yellow:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', val: 'text-yellow-300' },
    red:     { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    val: 'text-red-300' },
    violet:  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-400', val: 'text-violet-300' },
    emerald: { bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',icon: 'text-emerald-400',val: 'text-emerald-300' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className={`bg-slate-900/60 border ${c.border} rounded-2xl p-5 hover:bg-slate-900 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-extrabold ${c.val} mb-0.5`}>{value ?? '—'}</p>
      <p className="text-slate-500 text-xs font-medium">{title}</p>
      {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const isCollege = user?.role === 'college'

  useEffect(() => {
    if (isCollege) { setLoading(false); return }
    analyticsAPI.adminDashboard()
      .then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [isCollege])

  // College users get dedicated college dashboard
  if (isCollege) return <CollegeDashboard />

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              {isCollege ? 'College Admin' : 'Super Admin'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Control Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <Activity size={14} className="text-green-400" />
          <span className="text-green-400 text-sm font-medium">All Systems Online</span>
        </div>
      </div>

      {/* Stat cards */}
      {isCollege ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <DarkStatCard title="Total Students"    value={stats?.total_students}      icon={Users}       color="blue"   change={12} />
          <DarkStatCard title="Verified Students" value={stats?.verified_students}   icon={CheckCircle} color="green"  />
          <DarkStatCard title="Placement Rate"    value={`${stats?.application_stats?.placement_rate || 0}%`} icon={Trophy} color="yellow" />
          <DarkStatCard title="Total Applications"value={stats?.application_stats?.total} icon={FileText} color="violet" />
          <DarkStatCard title="Shortlisted"       value={stats?.application_stats?.shortlisted} icon={TrendingUp} color="emerald" />
          <DarkStatCard title="Selected"          value={stats?.application_stats?.selected}    icon={CheckCircle} color="green" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DarkStatCard title="Total Students"     value={stats?.total_students}    icon={Users}        color="blue"    change={8}  />
          <DarkStatCard title="Total Companies"    value={stats?.total_companies}   icon={Building2}    color="emerald" change={3}  />
          <DarkStatCard title="Pending Approval"   value={stats?.pending_companies} icon={AlertCircle}  color="yellow"  />
          <DarkStatCard title="Active Jobs"        value={stats?.active_jobs}       icon={Briefcase}    color="violet"  />
          <DarkStatCard title="Active Internships" value={stats?.active_internships}icon={GraduationCap}color="blue"   />
          <DarkStatCard title="Total Applications" value={stats?.total_applications}icon={FileText}     color="violet" change={15} />
          <DarkStatCard title="Students Placed"    value={stats?.selected_students} icon={CheckCircle}  color="green"  />
          <DarkStatCard title="Placement Rate"     value={`${stats?.placement_rate || 0}%`} icon={Trophy} color="yellow" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-400" /> Weekly Platform Activity
            </h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="url(#appGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-blue-400" /> Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { to: '/admin/companies/verification', label: 'Verify Companies',  icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { to: '/admin/students',               label: 'Manage Students',   icon: Users,       color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
              { to: '/admin/analytics',              label: 'Skill Analytics',   icon: BarChart3,   color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { to: '/admin/training',               label: 'Training Programs', icon: GraduationCap,color:'text-emerald-400',bg: 'bg-emerald-500/10'},
            ].map(({ to, label, icon: Icon, color, bg }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-colors group">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={color} />
                </div>
                <span className="text-slate-300 text-sm font-medium flex-1">{label}</span>
                <ArrowRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent log */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-blue-400" /> Recent Activity Log
        </h2>
        <div className="space-y-2">
          {[
            { msg: 'TechWave Solutions submitted for verification', time: '2 min ago', dot: 'bg-yellow-400' },
            { msg: 'Arjun Sharma completed AI Interview — Score: 82/100', time: '15 min ago', dot: 'bg-green-400' },
            { msg: 'New internship posted by DataBridge Analytics', time: '1 hr ago', dot: 'bg-blue-400' },
            { msg: 'Priya Patil skill passport verified by SKN Pandharpur', time: '2 hr ago', dot: 'bg-violet-400' },
            { msg: 'Industry challenge submitted — TechWave x Team Alpha', time: '3 hr ago', dot: 'bg-emerald-400' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
              <span className="text-slate-300 text-sm flex-1">{a.msg}</span>
              <span className="text-slate-600 text-xs flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
