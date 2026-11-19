import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { challengesAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { Zap, PlusCircle, Users, Eye } from 'lucide-react'

export default function CompanyChallenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    challengesAPI.list()
      .then(res => setChallenges(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Industry Challenges</h1>
        <Link to="/company/challenges/create" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Create Challenge
        </Link>
      </div>

      {loading ? <LoadingSpinner center /> : challenges.length === 0 ?
        <EmptyState icon={Zap} title="No challenges yet"
          description="Create industry challenges to find talented students."
          action={<Link to="/company/challenges/create" className="btn-primary">Create your first challenge</Link>} /> : (
        <div className="space-y-3">
          {challenges.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                    <span>Deadline: {c.deadline}</span>
                    <span><Users size={10} className="inline" /> {c.teams_count} team(s)</span>
                    <span>{c.submissions_count} submission(s)</span>
                  </div>
                </div>
                <Link to={`/student/challenges/${c.id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0">
                  <Eye size={12} /> View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
