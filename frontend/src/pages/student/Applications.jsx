import React, { useEffect, useState } from 'react'
import { applicationsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { FileText, CheckCircle, Clock, XCircle, Star } from 'lucide-react'

const statusConfig = {
  applied: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Applied' },
  under_review: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Under Review' },
  shortlisted: { color: 'bg-purple-100 text-purple-700', icon: Star, label: 'Shortlisted' },
  interview: { color: 'bg-indigo-100 text-indigo-700', icon: Star, label: 'Interview' },
  selected: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Selected ✓' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Withdrawn' },
}

export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    applicationsAPI.myApplications()
      .then(res => setApps(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

      <div className="flex flex-wrap gap-2">
        {['all', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors
              ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner center /> : filtered.length === 0 ?
        <EmptyState icon={FileText} title="No applications" description="Apply to jobs and internships to see them here." /> : (
        <div className="space-y-3">
          {filtered.map(app => {
            const cfg = statusConfig[app.status] || statusConfig.applied
            const StatusIcon = cfg.icon
            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{app.job_title}</p>
                    <p className="text-sm text-gray-500">{app.company_name}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    {app.match_score && (
                      <p className="text-xs text-blue-600 font-medium mt-1">Match: {app.match_score?.toFixed(1)}%</p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                    <StatusIcon size={11} />{cfg.label}
                  </span>
                </div>
                {app.rejection_reason && app.status === 'rejected' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg text-xs text-red-700">
                    <p className="font-semibold mb-1">Rejection feedback:</p>
                    <p>{app.rejection_reason}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
