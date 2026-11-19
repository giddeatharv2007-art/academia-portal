import React, { useEffect, useState } from 'react'
import { applicationsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import { FileText, ChevronDown } from 'lucide-react'

const STATUSES = ['applied','under_review','shortlisted','interview','selected','rejected']
const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-purple-100 text-purple-700', interview: 'bg-indigo-100 text-indigo-700',
  selected: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
}

export default function CompanyApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    applicationsAPI.myApplications()
      .then(res => setApps(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateStatus = async (id, newStatus, reason = '') => {
    try {
      await applicationsAPI.updateStatus(id, { status: newStatus, rejection_reason: reason })
      setApps(apps.map(a => a.id === id ? { ...a, status: newStatus } : a))
      toast.success(`Status updated to ${newStatus}`)
    } catch { toast.error('Failed to update status') }
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors
              ${filter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner center /> : filtered.length === 0 ?
        <EmptyState icon={FileText} title="No applications" description="Applications will appear here when students apply." /> : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900">{app.student_name}</p>
                  <p className="text-sm text-gray-500">{app.student_email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">For: {app.job_title} • {new Date(app.applied_at).toLocaleDateString()}</p>
                  {app.match_score && <p className="text-xs text-blue-600 font-medium mt-1">Match: {app.match_score?.toFixed(1)}%</p>}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status?.replace('_', ' ')}
                  </span>

                  {/* Status update dropdown */}
                  <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                    value={app.status}
                    onChange={e => handleUpdateStatus(app.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                  </select>
                </div>
              </div>

              {app.cover_letter && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Cover Letter:</p>
                  {app.cover_letter}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
