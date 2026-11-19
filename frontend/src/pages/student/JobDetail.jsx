import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI, matchingAPI } from '../../services/api'
import MatchScore from '../../components/common/MatchScore'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { MapPin, Clock, Building2, ArrowLeft, Send } from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [match, setMatch] = useState(null)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([jobsAPI.getJob(id), matchingAPI.matchJob(id)])
      .then(([jobRes, matchRes]) => { setJob(jobRes.data); setMatch(matchRes.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    try {
      await jobsAPI.applyJob(id, { cover_letter: coverLetter })
      toast.success('Applied successfully!')
      navigate('/student/applications')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <LoadingSpinner center />
  if (!job) return <div className="text-center text-gray-500 py-12">Job not found.</div>

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Building2 size={13} />{job.company_name}</span>
          {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
          <span className="capitalize">{job.work_mode}</span>
          <span className="capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{job.job_type?.replace('_', ' ')}</span>
        </div>
        {job.salary_min && <p className="text-green-600 font-semibold mt-2">₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()} per year</p>}
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{job.description}</p>
      </div>

      {match && (
        <MatchScore
          score={match.match_score}
          explanation={match.explanation}
          matchedSkills={match.matched_skills}
          missingSkills={match.missing_skills}
        />
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Apply for this Job</h2>
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
