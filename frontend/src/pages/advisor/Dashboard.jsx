import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ClipboardList, Users, FileCheck, Clock, CheckCircle2,
  XCircle, AlertCircle, BookOpen, ArrowUpRight, MoreHorizontal,
  Search, Filter, CalendarDays, Star, Bell, ChevronRight, TrendingUp,
} from 'lucide-react'

// ── Static demo data ────────────────────────────────────────────────────────
const stats = [
  { label: 'Total Applications', value: '128',  change: '+12 this week', icon: ClipboardList, color: 'rose'    },
  { label: 'Students Counselled', value: '84',  change: '+5 this week',  icon: Users,         color: 'pink'    },
  { label: 'Pending Reviews',    value: '23',   change: '4 urgent',      icon: Clock,         color: 'amber'   },
  { label: 'Docs Verified',      value: '61',   change: '+8 this week',  icon: FileCheck,     color: 'emerald' },
]

const colorMap = {
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400'    },
  pink:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    text: 'text-pink-400'    },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
}

const recentApplications = [
  { id: 1, name: 'Aarav Sharma',   program: 'B.Tech CSE',          status: 'under_review', date: 'Today'     },
  { id: 2, name: 'Priya Mehta',    program: 'MBA Marketing',       status: 'accepted',     date: 'Yesterday' },
  { id: 3, name: 'Rohan Patil',    program: 'BCA Data Science',    status: 'pending_docs', date: '2 days ago'},
  { id: 4, name: 'Sneha Kulkarni', program: 'B.Sc Biotechnology',  status: 'rejected',     date: '3 days ago'},
  { id: 5, name: 'Karan Desai',    program: 'B.Com Finance',       status: 'accepted',     date: '4 days ago'},
  { id: 6, name: 'Ananya Joshi',   program: 'M.Tech AI/ML',        status: 'under_review', date: '5 days ago'},
]

const sessions = [
  { id: 1, student: 'Aarav Sharma',  time: '10:00 AM', type: 'Program Selection'   },
  { id: 2, student: 'Divya Joshi',   time: '11:30 AM', type: 'Document Review'     },
  { id: 3, student: 'Mihir Bose',    time: '2:00 PM',  type: 'Admission Follow-up' },
  { id: 4, student: 'Lena D\'souza', time: '4:00 PM',  type: 'Fee Counselling'     },
]

const statusConfig = {
  under_review: { label: 'Under Review', Icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  accepted:     { label: 'Accepted',     Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  pending_docs: { label: 'Pending Docs', Icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  rejected:     { label: 'Rejected',     Icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
}

const funnel = [
  { stage: 'Enquiry',      count: 248, pct: 100, color: 'bg-rose-500'    },
  { stage: 'Applied',      count: 128, pct: 52,  color: 'bg-pink-500'    },
  { stage: 'Under Review', count: 63,  pct: 25,  color: 'bg-fuchsia-500' },
  { stage: 'Enrolled',     count: 31,  pct: 13,  color: 'bg-purple-500'  },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function AdvisorDashboard() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = recentApplications.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.program.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-rose-400" />
            <span className="text-rose-400 text-xs font-semibold uppercase tracking-widest">Acadmissions Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Welcome back, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your admissions pipeline today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30
            border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium transition-all">
            <Bell size={15} />
            <span className="hidden sm:inline">Notifications</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500
            text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-900/30">
            <ClipboardList size={15} />
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>
      </div>

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => {
          const c = colorMap[color]
          return (
            <div key={label} className={`rounded-2xl ${c.bg} border ${c.border} p-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-medium">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <Icon size={15} className={c.text} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold ${c.text}`}>{value}</p>
              <p className="text-slate-600 text-xs flex items-center gap-1">
                <TrendingUp size={11} className="text-emerald-500" />{change}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Applications + Sessions ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Applications table */}
        <div className="lg:col-span-2 bg-[#130810] border border-rose-900/30 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rose-900/30">
            <div>
              <h2 className="text-white font-bold text-base">Recent Applications</h2>
              <p className="text-slate-600 text-xs mt-0.5">Latest student admissions requests</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" />
                <input type="text" placeholder="Search..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-slate-900/60 border border-slate-700/50 text-slate-300 text-xs rounded-lg
                    pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500/50 w-36 placeholder-slate-600" />
              </div>
              <button className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-500 hover:text-slate-300">
                <Filter size={13} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-rose-900/20">
            {filtered.length === 0
              ? <div className="py-12 text-center text-slate-600 text-sm">No applications found.</div>
              : filtered.map(app => {
                  const s = statusConfig[app.status]
                  return (
                    <div key={app.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-rose-500/5 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20
                        flex items-center justify-center flex-shrink-0">
                        <span className="text-rose-400 font-bold text-sm">{app.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-semibold truncate">{app.name}</p>
                        <p className="text-slate-500 text-xs truncate">{app.program}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${s.bg} ${s.border} border ${s.color}`}>
                        <s.Icon size={11} />{s.label}
                      </span>
                      <span className="text-slate-600 text-xs hidden sm:block flex-shrink-0">{app.date}</span>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-slate-300 transition-all">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  )
                })
            }
          </div>
          <div className="px-5 py-3 border-t border-rose-900/30">
            <button className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium">
              View all applications <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Today's sessions */}
        <div className="bg-[#130810] border border-rose-900/30 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-rose-900/30">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-rose-400" />
              <h2 className="text-white font-bold text-base">Today's Sessions</h2>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">Upcoming counselling appointments</p>
          </div>
          <div className="flex-1 divide-y divide-rose-900/20">
            {sessions.map(s => (
              <div key={s.id} className="px-5 py-3.5 hover:bg-rose-500/5 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-slate-200 text-sm font-semibold">{s.student}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{s.type}</p>
                  </div>
                  <span className="text-rose-400 text-xs font-mono font-semibold flex-shrink-0
                    bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                    {s.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-rose-900/30">
            <button className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30
              text-rose-300 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
              <CalendarDays size={14} />
              Schedule New Session
            </button>
          </div>
        </div>
      </div>

      {/* ── Admission Funnel ─────────────────────────────────────────────── */}
      <div className="bg-[#130810] border border-rose-900/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-base">Admission Funnel</h2>
            <p className="text-slate-600 text-xs mt-0.5">Application stage breakdown</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors">
            Full Analytics <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {funnel.map(({ stage, count, pct, color }) => (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">{stage}</span>
                <span className="text-white text-xs font-bold">{count}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full opacity-80`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-slate-600 text-xs">{pct}% of enquiries</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Enquiry → Applied',     rate: '52%', icon: '📋' },
            { label: 'Applied → Review',       rate: '49%', icon: '🔍' },
            { label: 'Review → Enrolled',      rate: '49%', icon: '🎓' },
          ].map(({ label, rate, icon }) => (
            <div key={label} className="flex items-center gap-3 bg-rose-500/5 border border-rose-500/15 rounded-xl p-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-rose-400 font-bold text-sm">{rate} conversion</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Application', icon: ClipboardList, color: 'rose'  },
          { label: 'Schedule Session', icon: CalendarDays, color: 'pink'  },
          { label: 'Verify Document',  icon: FileCheck,    color: 'fuchsia'},
          { label: 'View Analytics',   icon: Star,         color: 'purple' },
        ].map(({ label, icon: Icon, color }) => (
          <button key={label}
            className={`flex items-center justify-center gap-2 py-3 bg-${color}-500/10 hover:bg-${color}-500/20
              border border-${color}-500/20 text-${color}-300 rounded-xl text-sm font-medium transition-all`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

    </div>
  )
}
