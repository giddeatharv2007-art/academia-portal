import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { analyticsAPI, collegeAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Users, BarChart3, GraduationCap, CheckCircle, TrendingUp,
  Bell, Plus, Send, MessageSquare, AlertTriangle, Search,
  ChevronRight, BookOpen, X, RefreshCw, Eye, Copy,
  ShieldCheck, Award, Briefcase, Activity, Star,
} from 'lucide-react'

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  'w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm ' +
  'placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const palette = {
    blue:    { border: 'border-blue-500/20',    bg: 'bg-blue-500/8',    icon: 'text-blue-400',    val: 'text-blue-300'    },
    green:   { border: 'border-green-500/20',   bg: 'bg-green-500/8',   icon: 'text-green-400',   val: 'text-green-300'   },
    yellow:  { border: 'border-yellow-500/20',  bg: 'bg-yellow-500/8',  icon: 'text-yellow-400',  val: 'text-yellow-300'  },
    violet:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/8',  icon: 'text-violet-400',  val: 'text-violet-300'  },
    teal:    { border: 'border-teal-500/20',    bg: 'bg-teal-500/8',    icon: 'text-teal-400',    val: 'text-teal-300'    },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/8', icon: 'text-emerald-400', val: 'text-emerald-300' },
  }
  const c = palette[color]
  return (
    <div className={`border ${c.border} ${c.bg} rounded-2xl p-5 flex flex-col gap-2 hover:brightness-110 transition-all`}>
      <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center`}>
        <Icon size={16} className={c.icon} />
      </div>
      <p className={`text-2xl font-extrabold ${c.val} leading-none`}>{value ?? '—'}</p>
      <div>
        <p className="text-slate-300 text-xs font-semibold">{label}</p>
        {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Send Notification Modal ──────────────────────────────────────────────────
function NotificationModal({ onClose, onSend }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'general', target: 'all' })
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required')
      return
    }
    setSending(true)
    try {
      await onSend(form)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1528] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Bell size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">Send Notification</h2>
              <p className="text-slate-500 text-xs mt-0.5">Broadcast a message to your students</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Target audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'all',   label: 'All Students' },
                { val: 'year3', label: '3rd Year'     },
                { val: 'year4', label: '4th Year'     },
              ].map(({ val, label }) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, target: val }))}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all
                    ${form.target === val
                      ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                      : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
            <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="general">📢 General Announcement</option>
              <option value="training">📚 Training Program</option>
              <option value="skill_gap">⚠️ Skill Gap Alert</option>
              <option value="placement">🎯 Placement Opportunity</option>
              <option value="deadline">⏰ Deadline Reminder</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
            <input className={inputCls} placeholder="e.g. Campus Placement Drive — Aug 2026"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message *</label>
            <textarea className={`${inputCls} resize-none`} rows={4}
              placeholder="Write your message to students..."
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSend} disabled={sending || !form.title.trim() || !form.message.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white
                font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              {sending
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending...</>
                : <><Send size={14} /> Send Notification</>}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400
              hover:text-slate-200 hover:border-slate-500 text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Student Modal ────────────────────────────────────────────────────────
function AddStudentModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    full_name: '', email: '', branch: '',
    current_year: '2', graduation_year: new Date().getFullYear() + 2,
  })
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)   // holds result after success

  const handleAdd = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const result = await onAdd(form)
      setCreated(result)
    } finally {
      setSaving(false)
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(created.temp_password)
    toast.success('Temporary password copied!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1528] border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Plus size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">Add Student</h2>
              <p className="text-slate-500 text-xs mt-0.5">Create account directly — no invitation needed</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* ── Success state ── */}
          {created ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircle size={22} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-300 font-semibold text-sm">Student added successfully!</p>
                  <p className="text-slate-400 text-xs mt-0.5">{created.full_name} · {created.email}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temporary Login Credentials</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-16">Email:</span>
                  <span className="text-slate-200 text-sm font-mono">{created.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-16">Password:</span>
                  <span className="text-slate-200 text-sm font-mono flex-1 bg-slate-900 px-2 py-1 rounded-lg">{created.temp_password}</span>
                  <button onClick={copyPassword} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors">
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Share these credentials with the student. They can update their password after logging in.
              </p>

              <button onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Done
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name *</label>
                  <input className={inputCls} placeholder="e.g. Arjun Sharma"
                    value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address *</label>
                  <input type="email" className={inputCls} placeholder="student@email.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Branch / Dept.</label>
                  <input className={inputCls} placeholder="e.g. CSE"
                    value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Current Year</label>
                  <select className={inputCls} value={form.current_year}
                    onChange={e => setForm(f => ({ ...f, current_year: e.target.value }))}>
                    {[1, 2, 3, 4].map(y => (
                      <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Graduation Year</label>
                  <input type="number" className={inputCls} placeholder="2027"
                    value={form.graduation_year}
                    onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))} />
                </div>
              </div>

              <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-blue-400" />
                A student account will be created instantly. A temporary password will be generated for you to share.
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handleAdd} disabled={saving || !form.full_name.trim() || !form.email.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed
                    text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                  {saving
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Adding...</>
                    : <><Plus size={14} /> Add Student</>}
                </button>
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400
                  hover:text-slate-200 hover:border-slate-500 text-sm font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Suggestion Modal ─────────────────────────────────────────────────────────
function SuggestionModal({ student, onClose, onSend }) {
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!msg.trim()) { toast.error('Please write a message'); return }
    setSending(true)
    try {
      await onSend(student, msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1528] border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <MessageSquare size={15} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">Send Suggestion</h2>
              <p className="text-slate-500 text-xs mt-0.5">To: {student?.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Student info card */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{student?.full_name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{student?.full_name}</p>
              <p className="text-slate-500 text-xs">
                {student?.branch && `${student.branch} · `}
                {student?.current_year && `${student.current_year}${['st','nd','rd','th'][(student.current_year-1)%4]} Year`}
                {student?.cgpa && ` · CGPA ${student.cgpa}`}
              </p>
            </div>
            {student?.job_readiness_score > 0 && (
              <div className="ml-auto text-right">
                <p className={`text-sm font-bold ${student.job_readiness_score >= 70 ? 'text-green-400' : student.job_readiness_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(student.job_readiness_score)}%
                </p>
                <p className="text-slate-600 text-xs">Ready</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Suggestion / Feedback</label>
            <textarea className={`${inputCls} resize-none`} rows={5}
              placeholder="e.g. Focus on learning Docker and AWS — these are in high demand. Consider applying to the upcoming campus drive..."
              value={msg} onChange={e => setMsg(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSend} disabled={sending || !msg.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              {sending
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending...</>
                : <><Send size={14} /> Send Suggestion</>}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400
              hover:text-slate-200 hover:border-slate-500 text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Readiness badge ──────────────────────────────────────────────────────────
function ReadinessBadge({ score }) {
  const s = Math.round(score || 0)
  const cls = s >= 75 ? 'text-green-400 bg-green-500/10' : s >= 50 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{s}%</span>
}

// ─── Main College Dashboard ───────────────────────────────────────────────────
export default function CollegeDashboard() {
  const [stats,    setStats]    = useState(null)
  const [demand,   setDemand]   = useState(null)
  const [students, setStudents] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [studLoading, setStudLoading] = useState(false)
  const [search,   setSearch]   = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Modal visibility
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [suggTarget,     setSuggTarget]     = useState(null)

  // ── Load dashboard stats + demand ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      analyticsAPI.collegeAnalytics(),
      analyticsAPI.industryDemand(),
    ])
      .then(([sRes, dRes]) => { setStats(sRes.data); setDemand(dRes.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Load real student list ──────────────────────────────────────────────────
  const loadStudents = useCallback(async (q = '') => {
    setStudLoading(true)
    try {
      const res = await collegeAPI.listStudents(q)
      setStudents(res.data.students || [])
      setTotalStudents(res.data.total || 0)
    } catch {
      toast.error('Failed to load students')
    } finally {
      setStudLoading(false)
    }
  }, [])

  // Load students when switching to the Students tab
  useEffect(() => {
    if (activeTab === 'students') loadStudents(search)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'students') return
    const t = setTimeout(() => loadStudents(search), 350)
    return () => clearTimeout(t)
  }, [search, activeTab, loadStudents])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSendNotification = async (form) => {
    try {
      const res = await collegeAPI.sendNotification(form)
      toast.success(res.data.message || 'Notification sent!')
      setShowNotifModal(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send notification')
    }
  }

  const handleAddStudent = async (form) => {
    try {
      const res = await collegeAPI.addStudent(form)
      toast.success(`${res.data.student.full_name} added!`)
      // Refresh student list if on that tab
      if (activeTab === 'students') loadStudents(search)
      return res.data.student
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add student'
      toast.error(msg)
      throw err
    }
  }

  const handleSendSuggestion = async (student, message) => {
    try {
      const res = await collegeAPI.sendSuggestion(student.id, message)
      toast.success(res.data.message || 'Suggestion sent!')
      setSuggTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send suggestion')
    }
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const topGapSkills = demand?.skill_analysis?.filter(s => s.gap_percentage > 20).slice(0, 5) || []

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ── Modals ── */}
      {showNotifModal && (
        <NotificationModal onClose={() => setShowNotifModal(false)} onSend={handleSendNotification} />
      )}
      {showAddModal && (
        <AddStudentModal onClose={() => setShowAddModal(false)} onAdd={handleAddStudent} />
      )}
      {suggTarget && (
        <SuggestionModal student={suggTarget} onClose={() => setSuggTarget(null)} onSend={handleSendSuggestion} />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={15} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">College Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">College Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage students, track placements and close skill gaps</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl
              bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/30">
            <Plus size={15} /> Add Student
          </button>
          <button onClick={() => setShowNotifModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl
              border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors">
            <Bell size={15} /> Notify Students
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 w-fit">
        {[
          { key: 'overview',  label: '📊 Overview'  },
          { key: 'students',  label: '👥 Students'   },
          { key: 'analytics', label: '📈 Analytics'  },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all
              ${activeTab === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Users}      label="Total Students"     value={stats?.total_students ?? 0}                         color="blue"    />
            <StatCard icon={ShieldCheck}label="Verified Students"  value={stats?.verified_students ?? 0}                      color="green"   />
            <StatCard icon={Award}      label="Placement Rate"     value={`${stats?.application_stats?.placement_rate ?? stats?.selected_students ? Math.round((stats.selected_students / Math.max(stats.total_students,1)) * 100) : 0}%`} color="yellow" />
            <StatCard icon={Briefcase}  label="Total Applications" value={stats?.application_stats?.total ?? stats?.total_applications ?? 0}        color="violet"  />
            <StatCard icon={TrendingUp} label="Shortlisted"        value={stats?.application_stats?.shortlisted ?? 0}          color="teal"    />
            <StatCard icon={CheckCircle}label="Selected"           value={stats?.application_stats?.selected ?? stats?.selected_students ?? 0}       color="emerald" />
          </div>

          {/* Skill gap alerts */}
          {topGapSkills.length > 0 && (
            <div className="bg-[#0d1528] border border-red-500/15 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-400" />
                  Critical Skill Gaps — Action Required
                </h2>
                <Link to="/college/analytics"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Full Report <ChevronRight size={12} />
                </Link>
              </div>

              <div className="space-y-3.5">
                {topGapSkills.map(s => (
                  <div key={s.skill} className="flex items-center gap-3">
                    <span className="text-slate-300 text-sm w-28 flex-shrink-0 truncate">{s.skill}</span>
                    <div className="flex-1 space-y-1">
                      {/* Demand bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${s.demand_percentage}%` }} />
                        </div>
                        <span className="text-xs text-blue-400 w-9 text-right">{s.demand_percentage}%</span>
                        <span className="text-xs text-slate-600 w-12">demand</span>
                      </div>
                      {/* Availability bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${s.student_availability_percentage}%` }} />
                        </div>
                        <span className="text-xs text-green-400 w-9 text-right">{s.student_availability_percentage}%</span>
                        <span className="text-xs text-slate-600 w-12">available</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-1
                      ${s.gap_severity === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      −{s.gap_percentage}%
                    </span>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowNotifModal(true)}
                className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-semibold
                  py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-blue-500/50
                  hover:text-blue-300 transition-colors">
                <Bell size={14} /> Notify Students About These Skill Gaps
              </button>
            </div>
          )}

          {/* Quick actions — all links use /college/ base */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'View Skill Analytics', icon: BarChart3,   to: '/college/analytics',  color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
              { label: 'Manage Training',       icon: BookOpen,    to: '/college/training',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Browse Companies',      icon: Briefcase,   to: '/college/companies',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10'  },
            ].map(({ label, icon: Icon, to, color, bg }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-4 bg-[#0d1528] border border-slate-800
                  hover:border-slate-600 rounded-2xl transition-all group">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <span className="text-slate-300 text-sm font-medium flex-1">{label}</span>
                <ChevronRight size={13} className="text-slate-700 group-hover:text-slate-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════ STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input className={`${inputCls} pl-9`}
                placeholder="Search by name, branch or email..."
                value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => loadStudents(search)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700
                text-slate-400 hover:text-slate-200 hover:border-slate-500 text-sm transition-colors">
              <RefreshCw size={13} className={studLoading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
                text-white text-sm font-semibold transition-colors">
              <Plus size={14} /> Add Student
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#0d1528] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Registered Students</h2>
              <span className="text-slate-500 text-xs bg-slate-800 px-2.5 py-1 rounded-full">
                {totalStudents} total
              </span>
            </div>

            {studLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={36} className="text-slate-700 mb-3" />
                <p className="text-slate-500 font-medium">No students found</p>
                <p className="text-slate-600 text-xs mt-1">
                  {search ? 'Try a different search term.' : 'Add students using the button above.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/70">
                {students.map((s) => (
                  <div key={s.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors group">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                      flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white text-sm font-bold">
                        {(s.full_name || s.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium truncate">{s.full_name || '(No name)'}</p>
                        {s.is_education_verified && (
                          <CheckCircle size={12} className="text-green-400 flex-shrink-0" title="Education verified" />
                        )}
                      </div>
                      <p className="text-slate-500 text-xs truncate">
                        {[s.branch, s.current_year ? `${s.current_year}${['st','nd','rd','th'][(s.current_year-1)%4]} Year` : null,
                          s.cgpa ? `CGPA: ${s.cgpa}` : null
                        ].filter(Boolean).join(' · ')}
                      </p>
                      {s.email && <p className="text-slate-600 text-xs truncate">{s.email}</p>}
                    </div>

                    {/* Skills + readiness */}
                    <div className="hidden sm:flex items-center gap-4 text-xs flex-shrink-0">
                      <div className="text-center">
                        <p className="text-blue-400 font-semibold">{s.skill_count ?? 0}</p>
                        <p className="text-slate-600">Skills</p>
                      </div>
                      <div className="text-center">
                        <ReadinessBadge score={s.job_readiness_score} />
                        <p className="text-slate-600 mt-0.5">Ready</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setSuggTarget(s)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg
                          text-violet-400 bg-violet-500/8 hover:bg-violet-500/20 border border-violet-500/20
                          hover:border-violet-500/40 transition-colors">
                        <MessageSquare size={11} /> Suggest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Career goals */}
          {stats?.career_goals && Object.keys(stats.career_goals).length > 0 ? (
            <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-blue-400" /> Student Career Goals
              </h2>
              <div className="space-y-2.5">
                {Object.entries(stats.career_goals)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([goal, count]) => {
                    const max = Math.max(...Object.values(stats.career_goals))
                    return (
                      <div key={goal} className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm w-40 flex-shrink-0 truncate">{goal}</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="text-slate-300 text-xs font-semibold w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-10 text-center">
              <BarChart3 size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Career goals data not available yet.</p>
              <p className="text-slate-600 text-xs mt-1">Encourage students to fill their career goal in their profile.</p>
            </div>
          )}

          {/* Top skills */}
          {stats?.top_skills && stats.top_skills.length > 0 && (
            <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star size={15} className="text-emerald-400" /> Most Common Student Skills
              </h2>
              <div className="space-y-2.5">
                {stats.top_skills.slice(0, 8).map(({ skill, count }) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm w-32 flex-shrink-0 truncate">{skill}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / (stats.top_skills[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-slate-300 text-xs font-semibold w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Link to="/college/analytics"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
              bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20
              hover:border-blue-500/40 font-semibold text-sm transition-all">
            <BarChart3 size={15} /> View Full Industry Demand Analytics
          </Link>
        </div>
      )}
    </div>
  )
}
