import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentAPI, matchingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  Briefcase, GraduationCap, Award, Star, ArrowRight, CheckCircle,
  Target, Zap, Video, TrendingUp, MapPin, Clock, Building2,
  Sparkles, BookOpen, Trophy, Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

function VioletStatCard({ title, value, icon: Icon, subtitle, color = 'violet' }) {
  const colors = {
    violet:  { bg: 'from-violet-500/10 to-indigo-500/10', border: 'border-violet-200', icon: 'text-violet-600', val: 'text-violet-700' },
    green:   { bg: 'from-emerald-500/10 to-green-500/10',  border: 'border-emerald-200',icon: 'text-emerald-600',val: 'text-emerald-700' },
    blue:    { bg: 'from-blue-500/10 to-cyan-500/10',       border: 'border-blue-200',  icon: 'text-blue-600',  val: 'text-blue-700'   },
    orange:  { bg: 'from-orange-500/10 to-yellow-500/10',   border: 'border-orange-200',icon: 'text-orange-600',val: 'text-orange-700' },
  }
  const c = colors[color]
  return (
    <div className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 border ${c.border} flex items-center justify-center mb-3`}>
        <Icon size={18} className={c.icon} />
      </div>
      <p className={`text-2xl font-extrabold ${c.val}`}>{value ?? '—'}</p>
      <p className="text-gray-600 text-xs font-medium mt-0.5">{title}</p>
      {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [topMatches, setTopMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([studentAPI.getDashboard(), matchingAPI.matchInternships()])
      .then(([sRes, mRes]) => {
        setStats(sRes.data)
        setTopMatches(mRes.data.results?.slice(0, 3) || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
    </div>
  )

  const readiness = stats?.job_readiness_score || 0
  const radialData = [{ value: readiness, fill: '#7c3aed' }]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-violet-200" />
              <span className="text-violet-200 text-xs font-semibold uppercase tracking-widest">Student Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              Welcome back! 👋
            </h1>
            <p className="text-violet-200 text-sm">
              You have <span className="font-bold text-white">{topMatches.length} new internship matches</span> today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/student/interview"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <Video size={13} /> AI Interview
            </Link>
            <Link to="/student/skill-gap"
              className="flex items-center gap-1.5 bg-white text-violet-700 hover:bg-violet-50 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-md">
              <Target size={13} /> Skill Gap
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VioletStatCard title="Skills Added"    value={stats?.skill_count || 0}           icon={Star}          color="violet"
          subtitle={`${stats?.verified_skill_count || 0} verified`} />
        <VioletStatCard title="Projects"        value={stats?.project_count || 0}         icon={Award}         color="blue"   />
        <VioletStatCard title="Certifications"  value={stats?.certification_count || 0}   icon={CheckCircle}   color="green"  />
        <VioletStatCard title="Applications"    value={stats?.application_count || 0}     icon={Briefcase}     color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job Readiness */}
        <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-600" /> Job Readiness
          </h2>
          <div className="h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: '#f3f0ff' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-violet-700">{readiness.toFixed(0)}%</span>
              <span className="text-xs text-gray-400">Ready</span>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {[
              { label: 'Profile',    done: (stats?.profile_completion || 0) > 60 },
              { label: 'Skills',     done: (stats?.skill_count || 0) > 3          },
              { label: 'Project',    done: (stats?.project_count || 0) > 0        },
              { label: 'AI Interview', done: false                                 },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                {done
                  ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                  : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 flex-shrink-0" />}
                <span className={done ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
              </div>
            ))}
          </div>
          <Link to="/student/skill-gap"
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 
              text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            <Target size={13} /> View Skill Gap
          </Link>
        </div>

        {/* Profile completion */}
        <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-violet-600" /> Profile Completion
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-extrabold text-violet-700">{(stats?.profile_completion || 0).toFixed(0)}%</span>
            <Link to="/student/profile/edit" className="text-xs text-violet-600 font-medium hover:underline">Edit →</Link>
          </div>
          <div className="w-full bg-violet-50 rounded-full h-2.5 mb-4">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${stats?.profile_completion || 0}%` }} />
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Personal Info',     pct: 100, done: true  },
              { label: 'Academic Details',  pct: 80,  done: true  },
              { label: 'Skills Added',      pct: (stats?.skill_count || 0) > 0 ? 100 : 0, done: (stats?.skill_count || 0) > 0 },
              { label: 'Projects',          pct: (stats?.project_count || 0) > 0 ? 100 : 0, done: (stats?.project_count || 0) > 0 },
              { label: 'Certifications',    pct: (stats?.certification_count || 0) > 0 ? 100 : 0, done: (stats?.certification_count || 0) > 0 },
            ].map(({ label, pct, done }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={done ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                  <span className={done ? 'text-violet-600 font-semibold' : 'text-gray-300'}>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className={`h-1 rounded-full ${done ? 'bg-violet-400' : 'bg-gray-200'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-violet-600" /> Applications
            </h2>
            <Link to="/student/applications" className="text-xs text-violet-600 font-medium hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {Object.entries({
              applied:      { color: 'bg-blue-100 text-blue-700',    label: 'Applied'       },
              under_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Under Review'  },
              shortlisted:  { color: 'bg-purple-100 text-purple-700', label: 'Shortlisted'   },
              interview:    { color: 'bg-indigo-100 text-indigo-700', label: 'Interview'      },
              selected:     { color: 'bg-green-100 text-green-700',   label: 'Selected ✓'    },
              rejected:     { color: 'bg-red-100 text-red-700',       label: 'Rejected'       },
            }).map(([key, { color, label }]) => {
              const count = stats?.applications_by_status?.[key] || 0
              return (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-violet-400 h-1.5 rounded-full"
                        style={{ width: `${(count / Math.max(stats?.application_count || 1, 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-5 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top matching internships */}
      {topMatches.length > 0 && (
        <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-600" /> Top Internship Matches For You
            </h2>
            <Link to="/student/internships" className="text-xs text-violet-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {topMatches.map(m => (
              <Link key={m.internship_id} to={`/student/internships/${m.internship_id}`}
                className="group block p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 
                  rounded-xl hover:border-violet-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-violet-700 transition-colors line-clamp-1">{m.title}</p>
                  <span className={`text-sm font-extrabold flex-shrink-0 ml-1
                    ${m.match_score >= 80 ? 'text-green-600' : m.match_score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {m.match_score?.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Building2 size={10} /> {m.company_name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <MapPin size={10} /> {m.location || 'Remote'} · {m.work_mode}
                </p>
                {m.stipend_min && (
                  <p className="text-xs font-semibold text-emerald-600">
                    ₹{m.stipend_min?.toLocaleString()}/month
                  </p>
                )}
                <div className="mt-2 w-full bg-violet-100 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${m.match_score}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick action pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/student/interview',    icon: Video,    label: 'Start AI Interview', gradient: 'from-violet-600 to-indigo-600', text: 'text-white' },
          { to: '/student/skill-passport',icon: Award,   label: 'Skill Passport',     gradient: 'from-purple-50 to-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
          { to: '/student/roadmap',       icon: Target,  label: 'Learning Roadmap',   gradient: 'from-blue-50 to-indigo-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
          { to: '/student/challenges',    icon: Zap,     label: 'Challenges',         gradient: 'from-orange-50 to-yellow-50', text: 'text-orange-700', border: 'border-orange-200' },
        ].map(({ to, icon: Icon, label, gradient, text, border }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-br ${gradient} 
              ${border ? `border ${border}` : ''} font-medium text-sm ${text} hover:opacity-90 transition-opacity shadow-sm`}>
            <Icon size={16} className="flex-shrink-0" />
            <span className="leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
