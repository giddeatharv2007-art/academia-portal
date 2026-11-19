import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { challengesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Building2, Clock, Users, Zap, ArrowLeft, Send, Github } from 'lucide-react'

export default function ChallengeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [submission, setSubmission] = useState({ github_url: '', demo_url: '', description: '' })
  const [showSubmit, setShowSubmit] = useState(false)

  useEffect(() => {
    challengesAPI.get(id)
      .then(res => setChallenge(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleJoin = async () => {
    if (!teamName.trim()) return toast.error('Enter a team name')
    setJoining(true)
    try {
      await challengesAPI.join(id, { team_name: teamName })
      toast.success('Joined challenge!')
      setTeamName('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join')
    } finally {
      setJoining(false)
    }
  }

  const handleSubmit = async () => {
    if (!submission.github_url || !submission.description) {
      return toast.error('GitHub URL and description are required')
    }
    setSubmitting(true)
    try {
      await challengesAPI.submit(id, { ...submission, tech_stack: [] })
      toast.success('Solution submitted!')
      setShowSubmit(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner center />
  if (!challenge) return <div className="text-center text-gray-500 py-12">Challenge not found.</div>

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Back to Challenges
      </button>

      {/* Header */}
      <div className="card bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <div className="flex items-start gap-2 mb-2">
          <Zap size={20} className="flex-shrink-0 mt-0.5" />
          <h1 className="text-xl font-bold">{challenge.title}</h1>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-orange-100">
          <span className="flex items-center gap-1"><Building2 size={13} />{challenge.company_name}</span>
          <span className="flex items-center gap-1"><Clock size={13} />Deadline: {challenge.deadline}</span>
          <span className="flex items-center gap-1"><Users size={13} />Team: {challenge.team_size_min}–{challenge.team_size_max} members</span>
        </div>
        {challenge.possible_outcome && (
          <div className="mt-3 bg-white/20 rounded-lg p-2 text-sm font-medium">
            🏆 {challenge.possible_outcome}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">About this Challenge</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{challenge.description}</p>
        <h3 className="font-semibold text-gray-900 mb-2">Problem Statement</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{challenge.problem_statement}</p>
      </div>

      {challenge.required_skills_detail?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {challenge.required_skills_detail.map(s => (
              <span key={s.id} className="skill-tag">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Submission requirements */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">Submission Requirements</h2>
        <p className="text-sm text-gray-600">{challenge.submission_requirements}</p>
      </div>

      {/* Join team */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Join / Create a Team</h2>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter your team name"
            value={teamName} onChange={e => setTeamName(e.target.value)} />
          <button onClick={handleJoin} disabled={joining} className="btn-primary flex items-center gap-2">
            {joining ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Users size={15} />}
            Join
          </button>
        </div>
      </div>

      {/* Submit solution */}
      {!showSubmit ? (
        <button onClick={() => setShowSubmit(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Send size={16} /> Submit Your Solution
        </button>
      ) : (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Submit Solution</h2>
          <div>
            <label className="label">GitHub Repository URL *</label>
            <input type="url" className="input" placeholder="https://github.com/..."
              value={submission.github_url} onChange={e => setSubmission({ ...submission, github_url: e.target.value })} />
          </div>
          <div>
            <label className="label">Demo URL (optional)</label>
            <input type="url" className="input" placeholder="https://..."
              value={submission.demo_url} onChange={e => setSubmission({ ...submission, demo_url: e.target.value })} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Describe your solution, approach, and tech stack..."
              value={submission.description} onChange={e => setSubmission({ ...submission, description: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={15} />}
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
            <button onClick={() => setShowSubmit(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
