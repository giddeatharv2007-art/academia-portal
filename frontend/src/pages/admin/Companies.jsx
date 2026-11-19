import React, { useEffect, useState } from 'react'
import { companiesAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Building2, CheckCircle, Clock, XCircle, ExternalLink,
  MoreVertical, ShieldCheck, ShieldX, RotateCcw
} from 'lucide-react'

const STATUS_CONFIG = {
  approved: {
    icon: <CheckCircle size={13} className="text-green-500" />,
    badge: 'bg-green-50 text-green-700 border-green-200',
    label: 'Approved',
  },
  pending: {
    icon: <Clock size={13} className="text-yellow-500" />,
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Pending',
  },
  rejected: {
    icon: <XCircle size={13} className="text-red-500" />,
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Rejected',
  },
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [openMenu, setOpenMenu] = useState(null)        // company id whose dropdown is open
  const [rejectModal, setRejectModal] = useState(null)  // { id, name }
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // company id being acted on

  useEffect(() => {
    loadCompanies()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = () => setOpenMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const loadCompanies = () => {
    setLoading(true)
    companiesAPI.getAllCompanies()
      .then(res => setCompanies(res.data.companies || []))
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false))
  }

  const updateCompanyStatus = (id, newStatus, reason = '') => {
    setCompanies(prev =>
      prev.map(c => c.id === id
        ? { ...c, verification_status: newStatus, is_verified: newStatus === 'approved', rejection_notes: reason }
        : c
      )
    )
  }

  const handleApprove = async (id, name) => {
    setActionLoading(id)
    try {
      const res = await companiesAPI.approveCompany(id)
      updateCompanyStatus(id, 'approved')
      const userId = res.data?.user_id
      const email  = res.data?.email
      toast.success(
        <div className="text-sm leading-relaxed">
          <p className="font-semibold">{name} approved ✓</p>
          {userId && <p className="text-gray-500 text-xs mt-0.5">User ID: {userId}</p>}
          {email  && <p className="text-gray-500 text-xs">Email: {email}</p>}
          <p className="text-gray-500 text-xs">Approval email sent.</p>
        </div>,
        { duration: 6000 }
      )
    } catch {
      toast.error('Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    const { id, name } = rejectModal
    setActionLoading(id)
    try {
      await companiesAPI.rejectCompany(id, rejectReason)
      updateCompanyStatus(id, 'rejected', rejectReason)
      toast.success(`${name} rejected`)
      setRejectModal(null)
      setRejectReason('')
    } catch {
      toast.error('Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'all' ? companies : companies.filter(c => c.verification_status === filter)

  const counts = {
    all: companies.length,
    pending: companies.filter(c => c.verification_status === 'pending').length,
    approved: companies.filter(c => c.verification_status === 'approved').length,
    rejected: companies.filter(c => c.verification_status === 'rejected').length,
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Companies</h1>
        <p className="text-sm text-gray-500 mt-1">{companies.length} companies registered</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors
              ${filter === s ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {s} <span className={`ml-1 ${filter === s ? 'text-violet-200' : 'text-gray-400'}`}>({counts[s]})</span>
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner center /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Company', 'Domain', 'Location', 'Status', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-10">No companies found.</td>
                </tr>
              ) : filtered.map(c => {
                const st = STATUS_CONFIG[c.verification_status] || STATUS_CONFIG.pending
                const isActing = actionLoading === c.id

                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    {/* Company */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.logo
                          ? <img src={c.logo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <Building2 size={13} className="text-violet-500" />
                            </div>
                        }
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="px-4 py-3 text-gray-600 capitalize">{c.domain || '—'}</td>

                    {/* Location */}
                    <td className="px-4 py-3 text-gray-600">{c.location || '—'}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${st.badge}`}>
                        {st.icon} {st.label}
                      </span>
                      {c.rejection_notes && (
                        <p className="text-xs text-red-400 mt-0.5 max-w-[140px] truncate" title={c.rejection_notes}>
                          {c.rejection_notes}
                        </p>
                      )}
                    </td>

                    {/* Registered */}
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          disabled={isActing}
                          onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                          title="Actions"
                        >
                          {isActing
                            ? <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin block" />
                            : <MoreVertical size={15} />
                          }
                        </button>

                        {openMenu === c.id && (
                          <div className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 text-sm">
                            {/* Approve — shown when pending or rejected */}
                            {c.verification_status !== 'approved' && (
                              <button
                                onClick={() => { setOpenMenu(null); handleApprove(c.id, c.name) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-green-700 hover:bg-green-50 transition-colors"
                              >
                                <ShieldCheck size={14} /> Approve
                              </button>
                            )}

                            {/* Reject — shown when pending or approved */}
                            {c.verification_status !== 'rejected' && (
                              <button
                                onClick={() => { setOpenMenu(null); setRejectModal({ id: c.id, name: c.name }) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <ShieldX size={14} /> Reject
                              </button>
                            )}

                            {/* Reset to pending — shown when approved or rejected */}
                            {c.verification_status !== 'pending' && (
                              <button
                                onClick={() => { setOpenMenu(null); handleApprove(c.id, c.name) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <RotateCcw size={14} /> Re-approve
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 mb-1">Reject Company</h3>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting <span className="font-medium text-gray-700">{rejectModal.name}</span>.
              A reason is optional but will be emailed to the company.
            </p>
            <textarea
              className="input resize-none mb-4 w-full"
              rows={3}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectModal?.id}
                className="btn-danger flex-1 disabled:opacity-60"
              >
                {actionLoading === rejectModal?.id ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
