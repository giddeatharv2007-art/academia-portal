import React, { useEffect, useState } from 'react'
import { companiesAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import { ShieldCheck, CheckCircle, XCircle, Building2, Globe } from 'lucide-react'

export default function CompanyVerification() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    companiesAPI.getPendingCompanies()
      .then(res => setCompanies(res.data.companies || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    try {
      await companiesAPI.approveCompany(id)
      setCompanies(companies.filter(c => c.id !== id))
      toast.success('Company approved! Email sent.')
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    try {
      await companiesAPI.rejectCompany(rejectModal, rejectReason)
      setCompanies(companies.filter(c => c.id !== rejectModal))
      toast.success('Company rejected.')
      setRejectModal(null)
      setRejectReason('')
    } catch { toast.error('Failed to reject') }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Verification</h1>
        <p className="text-sm text-gray-500 mt-1">{companies.length} companies pending review</p>
      </div>

      {loading ? <LoadingSpinner center /> : companies.length === 0 ?
        <EmptyState icon={ShieldCheck} title="All caught up!" description="No pending company verifications." /> : (
        <div className="space-y-4">
          {companies.map(c => (
            <div key={c.id} className="card border-l-4 border-l-yellow-400">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
                    <div><span className="text-gray-400">Email:</span> {c.email}</div>
                    <div><span className="text-gray-400">Domain:</span> <span className="capitalize">{c.domain}</span></div>
                    <div><span className="text-gray-400">Location:</span> {c.location || '—'}</div>
                    {c.website && <div><span className="text-gray-400">Website:</span> <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 inline-flex">{c.website} <Globe size={11} /></a></div>}
                    {c.contact_person_name && <div><span className="text-gray-400">Contact:</span> {c.contact_person_name} — {c.contact_person_designation}</div>}
                    {c.gstin && <div><span className="text-gray-400">GSTIN/CIN:</span> {c.gstin}</div>}
                    {c.established_year && <div><span className="text-gray-400">Est. Year:</span> {c.established_year}</div>}
                  </div>
                  {c.about && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.about}</p>}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(c.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => setRejectModal(c.id)}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 mb-3">Reject Company</h3>
            <p className="text-sm text-gray-500 mb-3">Provide a reason (optional — will be emailed to the company):</p>
            <textarea className="input resize-none mb-4" rows={3} placeholder="Reason for rejection..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={handleReject} className="btn-danger flex-1">Confirm Reject</button>
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
