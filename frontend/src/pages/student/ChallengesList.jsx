import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { challengesAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { Zap, Building2, Clock, Users, ExternalLink } from 'lucide-react'

export default function ChallengesList() {
  const [challenges, setChallenges] = useState([])
  const [myTeams, setMyTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([challengesAPI.list(), challengesAPI.myTeams()])
      .then(([cRes, tRes]) => {
        setChallenges(cRes.data.results || cRes.data || [])
        setMyTeams(tRes.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const joinedIds = new Set(myTeams.map(t => t.challenge_id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Industry Challenges</h1>
        <p className="text-sm text-gray-500 mt-1">Solve real problems from companies. Win internships and jobs.</p>
      </div>

      {/* My teams */}
      {myTeams.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="font-semibold text-blue-900 mb-3">My Active Teams</h2>
          <div className="space-y-2">
            {myTeams.map(t => (
              <Link key={t.team_id} to={`/student/challenges/${t.challenge_id}`}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.challenge_title}</p>
                  <p className="text-xs text-gray-500">Team: {t.team_name} • {t.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.has_submission && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Submitted</span>}
                  <ExternalLink size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner center /> : challenges.length === 0 ?
        <EmptyState icon={Zap} title="No active challenges" description="Check back later for new industry challenges." /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {challenges.map(c => (
            <Link key={c.id} to={`/student/challenges/${c.id}`} className="block">
              <div className="card hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200 h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{c.title}</h3>
                  {joinedIds.has(c.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">Joined</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Building2 size={11} />{c.company_name}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />Deadline: {c.deadline}</span>
                  <span className="flex items-center gap-1"><Users size={11} />Team: {c.team_size_min}–{c.team_size_max}</span>
                </div>

                {c.required_skills_detail?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.required_skills_detail.slice(0, 3).map(s => (
                      <span key={s.id} className="skill-tag">{s.name}</span>
                    ))}
                    {c.required_skills_detail.length > 3 && (
                      <span className="text-xs text-gray-400">+{c.required_skills_detail.length - 3}</span>
                    )}
                  </div>
                )}

                {c.possible_outcome && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800 flex items-center gap-1">
                    <Zap size={11} className="flex-shrink-0" /> {c.possible_outcome}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
