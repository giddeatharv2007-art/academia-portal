import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { internshipsAPI, matchingAPI } from '../../services/api'
import MatchScore from '../../components/common/MatchScore'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { MapPin, Building2, ArrowLeft, Send, Clock } from 'lucide-react'

export default function InternshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [internship, setInternship] = useState(null)
  const [match, setMatch] = useState(null)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([internshipsAPI.getInternship(id), matchingAPI.matchInternship(id)])
      .then(([iRes, mRes]) => { setInternship(iRes.data); setMatch(mRes.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    try {
      await internshipsAPI.applyInternship(id, { cover_letter: coverLetter })
      toast.success('Applied successfully!')
      navigate('/student/applications')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <LoadingSpinner center />
  if (!internship) return <div className="text-center text-gray-500 py-12">Internship not found.</div>

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900">{internship.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Building2 size={13} />{internship.company_name}</span>
          {internship.location && <span className="flex items-center gap-1"><MapPin size={13} />{internship.location}</span>}
          <span className="flex items-center gap-1"><Clock size={13} />{internship.duration_months} months</span>
          <span className="capitalize">{internship.work_mode}</span>
        </div>
        {internship.stipend_min && (
          <p className="text-green-600 font-semibold mt-2">
            ₹{internship.stipend_min?.toLocaleString()} - ₹{internship.stipend_max?.toLocaleString()} / month
          </p>
        )}
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{internship.description}</p>
      </div>

      {match && (
        <MatchScore score={match.match_score} explanation={match.explanation}
          matchedSkills={match.matched_skills} missingSkills={match.missing_skills} />
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Apply for this Internship</h2>
        <textarea className="input resize-none mb-3" rows={4}
          placeholder="Write a short cover letter (optional)..."
          value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
        <button onClick={handleApply} disabled={applying} className="btn-primary w-full flex items-center justify-center gap-2">
          {applying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={16} />}
          {applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  )
}
